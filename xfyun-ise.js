(() => {
  'use strict';

  const recorderPath = 'vendor/xfyun-recorder';
  let recorder = null;
  let socket = null;
  let recordTimer = null;
  let resultTimer = null;
  let uploadTimer = null;
  let authTimer = null;
  let socketTimer = null;
  let recorderStartTimer = null;
  let authController = null;
  let runSequence = 0;
  let audioFrames = [];
  let firstFrame = true;
  let recorderEnded = false;
  let callbacks = {};
  let activeFail = null;
  let recordingStartedAt = 0;
  let noiseLevels = [];
  let voiceThreshold = 0.018;
  let speechStarted = false;
  let activeFrameCount = 0;
  let silentDuration = 0;
  let stopSilence = 1000;
  let stopRequested = false;

  function emit(name, value) {
    if (typeof callbacks[name] === 'function') callbacks[name](value);
  }

  function bytesToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
  }

  function decodeBase64(value) {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  }

  function numberAttribute(element, name) {
    const attribute = element?.getAttribute(name);
    if (attribute == null || attribute === '') return null;
    const value = Number(attribute);
    if (!Number.isFinite(value)) return null;
    return Math.round(value >= 0 && value <= 5 ? value * 20 : value);
  }

  function frameRms(frameBuffer) {
    const view = new DataView(frameBuffer);
    let sum = 0;
    let count = 0;
    for (let offset = 0; offset + 1 < view.byteLength; offset += 2) {
      const value = view.getInt16(offset, true) / 32768;
      sum += value * value;
      count += 1;
    }
    return count ? Math.sqrt(sum / count) : 0;
  }

  function frameDuration(frameBuffer) {
    return frameBuffer.byteLength / 2 / 16000 * 1000;
  }

  function calibrateThreshold() {
    if (!noiseLevels.length) return 0.018;
    const levels = [...noiseLevels].sort((a, b) => a - b);
    const baseline = levels[Math.floor(levels.length * .3)] || 0;
    return Math.max(.014, Math.min(.055, baseline * 2.8 + .004));
  }

  function noSpeechError() {
    const error = new Error('没有听到有效朗读，请在“正在听”后开始读。');
    error.code = 'NO_SPEECH';
    return error;
  }

  function parseResult(encoded) {
    const xml = decodeBase64(encoded);
    const documentNode = new DOMParser().parseFromString(xml, 'application/xml');
    if (documentNode.querySelector('parsererror')) throw new Error('评测结果解析失败。');
    const summary = [...documentNode.querySelectorAll('read_sentence, read_word, read_chapter, rec_paper')]
      .find(element => element.hasAttribute('total_score') || element.hasAttribute('accuracy_score'));
    if (!summary) throw new Error('评测结果缺少评分。');
    const problemWords = [...documentNode.querySelectorAll('word')].filter(word => {
      const wordError = Number(word.getAttribute('dp_message') || word.getAttribute('werr_msg') || 0);
      const syllableError = [...word.querySelectorAll('syll')].some(syllable => {
        const value = Number(syllable.getAttribute('serr_msg') || 0);
        return value !== 0 && value !== 2048;
      });
      return wordError !== 0 || syllableError;
    }).map(word => word.getAttribute('content')).filter(Boolean);
    return {
      total: numberAttribute(summary, 'total_score'),
      accuracy: numberAttribute(summary, 'accuracy_score'),
      fluency: numberAttribute(summary, 'fluency_score'),
      integrity: numberAttribute(summary, 'integrity_score'),
      standard: numberAttribute(summary, 'standard_score'),
      problemWords: [...new Set(problemWords)]
    };
  }

  function cleanup(closeSocket = true) {
    clearTimeout(recordTimer);
    clearTimeout(resultTimer);
    clearTimeout(authTimer);
    clearTimeout(socketTimer);
    clearTimeout(recorderStartTimer);
    clearInterval(uploadTimer);
    recordTimer = null;
    resultTimer = null;
    authTimer = null;
    socketTimer = null;
    recorderStartTimer = null;
    uploadTimer = null;
    if (authController) {
      authController.abort();
      authController = null;
    }
    audioFrames = [];
    firstFrame = true;
    recorderEnded = false;
    activeFail = null;
    recordingStartedAt = 0;
    noiseLevels = [];
    voiceThreshold = .018;
    speechStarted = false;
    activeFrameCount = 0;
    silentDuration = 0;
    stopRequested = false;
    if (recorder) {
      try { recorder.stop(); } catch (_) {}
      recorder = null;
    }
    if (closeSocket && socket && socket.readyState < WebSocket.CLOSING) {
      try { socket.close(1000); } catch (_) {}
    }
    socket = null;
  }

  function audioData(frameBuffer, status) {
    return {
      status,
      encoding: 'raw',
      data_type: 1,
      data: frameBuffer ? bytesToBase64(frameBuffer) : ''
    };
  }

  function sendAudioFrame(frameBuffer, text, category) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    if (firstFrame) {
      firstFrame = false;
      const textHeader = category === 'read_word' ? '[word]' : '[content]';
      socket.send(JSON.stringify({
        common: { app_id: socket.appId },
        business: {
          category,
          rstcd: 'utf8',
          group: 'pupil',
          sub: 'ise',
          tte: 'utf-8',
          ttp_skip: true,
          cmd: 'ssb',
          auf: 'audio/L16;rate=16000',
          ent: 'en_vip',
          aus: 1,
          aue: 'raw',
          rst: 'entirety',
          ise_unite: '1',
          extra_ability: 'multi_dimension;syll_phone_err_msg',
          text: `\uFEFF${textHeader}\n${text}`
        },
        data: audioData(frameBuffer, 0)
      }));
      return;
    }
    socket.send(JSON.stringify({
      business: { aue: 'raw', cmd: 'auw', aus: 2 },
      data: audioData(frameBuffer, 1)
    }));
  }

  function startUpload(text, category) {
    uploadTimer = setInterval(() => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      if (!speechStarted) return;
      const frame = audioFrames.shift();
      if (frame) {
        sendAudioFrame(frame, text, category);
        return;
      }
      if (!recorderEnded || firstFrame) return;
      clearInterval(uploadTimer);
      uploadTimer = null;
      socket.send(JSON.stringify({
        business: { aue: 'raw', cmd: 'auw', aus: 4 },
        data: audioData(null, 2)
      }));
      emit('onState', 'processing');
    }, 40);
  }

  async function start({ text, category = 'read_sentence', ...handlers }) {
    cleanup();
    const runId = ++runSequence;
    callbacks = handlers;
    if (!window.RecorderManager) throw new Error('录音组件加载失败。');
    emit('onState', 'connecting');
    let response;
    const controller = new AbortController();
    const authTimeout = setTimeout(() => controller.abort(), 5000);
    authController = controller;
    authTimer = authTimeout;
    try {
      response = await fetch(window.XFYUN_AUTH_ENDPOINT || '/api/xfyun-auth', {
        cache: 'no-store',
        signal: controller.signal
      });
    } catch (cause) {
      const timedOut = cause?.name === 'AbortError';
      const error = new Error(timedOut ? '连接评测服务超时，请检查网络后重试。' : '讯飞签名服务暂时无法连接。');
      error.code = 'SERVICE_UNAVAILABLE';
      throw error;
    } finally {
      clearTimeout(authTimeout);
      if (authTimer === authTimeout) authTimer = null;
      if (authController === controller) authController = null;
    }
    if (runId !== runSequence) return;
    const auth = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(auth.error || '讯飞签名服务不可用。');
      error.code = response.status === 403 || response.status === 404 || response.status === 503 ? 'NOT_CONFIGURED' : 'AUTH_FAILED';
      throw error;
    }

    recorder = new RecorderManager(recorderPath);
    socket = new WebSocket(auth.url);
    socket.appId = auth.appId;
    let failed = false;
    const fail = error => {
      if (failed || runId !== runSequence) return;
      failed = true;
      if (socket) socket.onerror = null;
      cleanup();
      emit('onError', error);
    };
    activeFail = fail;
    socketTimer = setTimeout(() => {
      const error = new Error('连接讯飞评测超时，请检查网络后重试。');
      error.code = 'SERVICE_UNAVAILABLE';
      fail(error);
    }, 5000);
    recorder.onStart = () => {
      if (failed || runId !== runSequence) return;
      clearTimeout(recorderStartTimer);
      recorderStartTimer = null;
      emit('onState', 'recording');
      recordingStartedAt = Date.now();
      stopSilence = category === 'read_word' ? 1000 : 1400;
      recordTimer = setTimeout(() => {
        if (speechStarted) stop();
        else fail(noSpeechError());
      }, category === 'read_word' ? 6000 : 12000);
    };
    recorder.onFrameRecorded = ({ isLastFrame, frameBuffer }) => {
      if (failed || runId !== runSequence) return;
      if (frameBuffer?.byteLength) {
        audioFrames.push(frameBuffer);
        const elapsed = Date.now() - recordingStartedAt;
        const rms = frameRms(frameBuffer);
        const duration = frameDuration(frameBuffer);
        if (elapsed <= 800 && rms < .02) {
          noiseLevels.push(rms);
          voiceThreshold = calibrateThreshold();
        }
        const active = rms >= voiceThreshold;
        if (!speechStarted) {
          activeFrameCount = active ? activeFrameCount + 1 : Math.max(0, activeFrameCount - 1);
          if (activeFrameCount >= 3) {
            speechStarted = true;
            silentDuration = 0;
            emit('onState', 'voice-start');
          }
        } else {
          silentDuration = active ? 0 : silentDuration + duration;
          if (elapsed >= 800 && silentDuration >= stopSilence) stop();
        }
      }
      if (isLastFrame) recorderEnded = true;
    };
    socket.onopen = async () => {
      if (failed || runId !== runSequence) return;
      clearTimeout(socketTimer);
      socketTimer = null;
      try {
        startUpload(text, category);
        recorderStartTimer = setTimeout(() => {
          const error = new Error('麦克风启动超时，请检查浏览器麦克风权限。');
          error.code = 'RECORDER_TIMEOUT';
          fail(error);
        }, 4000);
        await recorder.start({ sampleRate: 16000, frameSize: 1280 });
      } catch (error) {
        fail(error);
      }
    };
    socket.onmessage = event => {
      if (failed || runId !== runSequence) return;
      const responseData = JSON.parse(event.data);
      if (responseData.code !== 0) {
        const error = new Error(responseData.message || `讯飞评测错误 ${responseData.code}`);
        error.code = responseData.code;
        fail(error);
        return;
      }
      if (responseData.data?.data) {
        try {
          emit('onResult', parseResult(responseData.data.data));
        } catch (error) {
          fail(error);
        }
      }
      if (responseData.data?.status === 2) cleanup();
    };
    socket.onerror = () => {
      const error = new Error('讯飞评测连接失败，已切换备用识别。');
      error.code = 'SERVICE_UNAVAILABLE';
      fail(error);
    };
  }

  function stop() {
    if (stopRequested) return;
    if (!speechStarted) {
      const fail = activeFail;
      if (fail) fail(noSpeechError());
      return;
    }
    stopRequested = true;
    clearTimeout(recordTimer);
    recordTimer = null;
    if (recorder) {
      recorder.stop();
      resultTimer = setTimeout(() => {
        const error = new Error('评分等待超时，请再读一次。');
        error.code = 'RESULT_TIMEOUT';
        cleanup();
        emit('onError', error);
      }, 12000);
    }
  }

  function cancel() {
    runSequence += 1;
    cleanup();
  }

  window.XfyunISE = { start, stop, cancel };
})();
