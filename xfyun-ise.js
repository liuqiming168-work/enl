(() => {
  'use strict';

  const recorderPath = 'vendor/xfyun-recorder';
  let recorder = null;
  let socket = null;
  let recordTimer = null;
  let resultTimer = null;
  let uploadTimer = null;
  let audioFrames = [];
  let firstFrame = true;
  let recorderEnded = false;
  let callbacks = {};

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
    clearInterval(uploadTimer);
    recordTimer = null;
    resultTimer = null;
    uploadTimer = null;
    audioFrames = [];
    firstFrame = true;
    recorderEnded = false;
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
    callbacks = handlers;
    if (!window.RecorderManager) throw new Error('录音组件加载失败。');
    emit('onState', 'connecting');
    let response;
    try {
      response = await fetch(window.XFYUN_AUTH_ENDPOINT || '/api/xfyun-auth', { cache: 'no-store' });
    } catch (_) {
      const error = new Error('讯飞签名服务暂时无法连接。');
      error.code = 'SERVICE_UNAVAILABLE';
      throw error;
    }
    const auth = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(auth.error || '讯飞签名服务不可用。');
      error.code = response.status === 404 || response.status === 503 ? 'NOT_CONFIGURED' : 'AUTH_FAILED';
      throw error;
    }

    recorder = new RecorderManager(recorderPath);
    socket = new WebSocket(auth.url);
    socket.appId = auth.appId;
    recorder.onStart = () => {
      emit('onState', 'recording');
      recordTimer = setTimeout(stop, 8000);
    };
    recorder.onFrameRecorded = ({ isLastFrame, frameBuffer }) => {
      if (frameBuffer?.byteLength) audioFrames.push(frameBuffer);
      if (isLastFrame) recorderEnded = true;
    };
    socket.onopen = async () => {
      try {
        startUpload(text, category);
        await recorder.start({ sampleRate: 16000, frameSize: 1280 });
      } catch (error) {
        cleanup();
        emit('onError', error);
      }
    };
    socket.onmessage = event => {
      const responseData = JSON.parse(event.data);
      if (responseData.code !== 0) {
        const error = new Error(responseData.message || `讯飞评测错误 ${responseData.code}`);
        error.code = responseData.code;
        cleanup();
        emit('onError', error);
        return;
      }
      if (responseData.data?.data) {
        try {
          emit('onResult', parseResult(responseData.data.data));
        } catch (error) {
          emit('onError', error);
        }
      }
      if (responseData.data?.status === 2) cleanup();
    };
    socket.onerror = () => {
      cleanup(false);
      const error = new Error('讯飞评测连接失败，已切换备用识别。');
      error.code = 'SERVICE_UNAVAILABLE';
      emit('onError', error);
    };
  }

  function stop() {
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

  window.XfyunISE = { start, stop, cancel: cleanup };
})();
