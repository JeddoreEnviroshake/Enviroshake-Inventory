import React from 'react';

export const generateCode39Barcode = (text) => {
  const code39 = {
    '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101',
    '4': '101001101011', '5': '110100110101', '6': '101100110101', '7': '101001011011',
    '8': '110100101101', '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
    'C': '110110100101', 'D': '101011001011', 'E': '110101100101', 'F': '101101100101',
    'G': '101010011011', 'H': '110101001101', 'I': '101101001101', 'J': '101010110101',
    'K': '110101010011', 'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
    'O': '110101101001', 'P': '101101101001', 'Q': '101010100111', 'R': '110101010101',
    'S': '101101010101', 'T': '101010110101', 'U': '110010101011', 'V': '100110101011',
    'W': '110011010101', 'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
    '-': '100101011011', '.': '110010101101', ' ': '100110101101', '*': '100101101101'
  };

  let barcode = code39['*'];
  const upperText = text.toUpperCase();
  for (let i = 0; i < upperText.length; i++) {
    const char = upperText[i];
    barcode += code39[char] ? code39[char] : code39[' '];
  }
  barcode += code39['*'];
  return barcode;
};

export const renderBarcodeSVG = (binaryCode, width = 200, height = 50) => {
  const bars = [];
  let xPos = 0;
  const barWidth = width / binaryCode.length;
  for (let i = 0; i < binaryCode.length; i++) {
    if (binaryCode[i] === '1') {
      bars.push(
        React.createElement('rect', {
          key: i,
          x: xPos,
          y: 0,
          width: barWidth,
          height: height,
          fill: 'black',
        })
      );
    }
    xPos += barWidth;
  }
  return React.createElement('svg', { width, height, className: 'barcode-svg' }, bars);
};
