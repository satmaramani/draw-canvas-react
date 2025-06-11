// WalkingKidsSvg.js
import React from 'react';

const WalkingKidsSvg = ({ onSectionClick, fillMap }) => (
  <svg viewBox="0 0 800 600">
    <path
      id="head-boy"
      d="M100,50 A30,30 0 1,0 160,50 A30,30 0 1,0 100,50"
      fill={fillMap['head-boy'] || '#fff'}
      stroke="#000"
      onClick={() => onSectionClick('head-boy')}
    />
    <path
      id="body-girl"
      d="M200,100 L220,200 L180,200 Z"
      fill={fillMap['body-girl'] || '#fff'}
      stroke="#000"
      onClick={() => onSectionClick('body-girl')}
    />
    {/* paste in all other path shapes here */}
  </svg>
);

export default WalkingKidsSvg;
