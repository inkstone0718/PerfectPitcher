import React from 'react';

const C: Record<string, string> = {
  'b': '#0a0a0a', 's': '#ffcda8', 'h': '#d99f77', 'm': '#c48860',
  'B': '#1a56e8', 'D': '#1040c0', 'N': '#0a2870', 'w': '#f0ece0',
  'g': '#c8c8b8', 'O': '#f5851f', 'E': '#c96a0a', 'F': '#7a3f00',
  'R': '#8b4513', 'T': '#6b3410', 'r': '#ef4444', 'G': '#22c55e',
  'W': '#d0d0c0', 'k': '#333333', 'P': '#ffddbb', 'L': '#aaa898',
};

const PITCHER = [
'________________________________',
'________________________________',
'____________DDDDDDD____________',
'___________DDDDDDDDD___________',
'___________DDDDDwwDDD___________',
'__________bDDDDDwwDDDb__________',
'__________bDDDDDDDDDDb__________',
'_________bsssssssssssb__________',
'_________bsPbsbsbPssb___________',
'_________bsssssssssb____________',
'__________bsshhhssb_____________',
'__________bbmmmmbb______________',
'_________BBBBBBBBBBBB___________',
'________BwwBBBBBBBBwwB__________',
'_______BwwwBBBBBBBBwwwB_________',
'_______BwwBBBBBBBBBBwwB_________',
'______BsswBBBBBBBBBBwssB________',
'______BhswBBwwBBwwBBwshB________',
'_______bwBBBBBBBBBBBBwb_________',
'________bBBBBBBBBBBBBb__________',
'________bwwwwwbbwwwwwb__________',
'_______bwwwwwwbbwwwwwwb_________',
'_______bwwLwwwbbwwwLwwb_________',
'_______bwwwwwwbbwwwwwwb_________',
'_______bwwwwwwbbwwwwwwb_________',
'_______bwwwwwwbbwwwwwwb_________',
'________bggggbbbbggggb__________',
'________bbbbbbbbbbbbbbb_________',
'________bbbb______bbbbb________',
'________________________________',
'________________________________',
'________________________________',
];

const BATTER = [
'________________________________',
'_______RR_______________________',
'_______RR_______________________',
'_______RR_______________________',
'_______RR_______________________',
'_______RR___OOOOOOO_____________',
'_______RR__OOOOOOOOO____________',
'_______RR__OOOOwwOOO____________',
'_______RTbbOOOOwwOOOb___________',
'_______TbbOOOOOOOOOOb___________',
'________bsssssssssssb___________',
'________bsPbsbsbPssb____________',
'________bsssssssssb_____________',
'_________bsshhhssb______________',
'_________bbmmmmbb_______________',
'________OOOOOOOOOOOO____________',
'_______OgwOOOOOOOOgwO___________',
'______OgwwOOOOOOOOgwwO__________',
'______OgwOOOOOOOOOOgwO__________',
'_____OsswOOOOOOOOOOwssO_________',
'_____OhswOOwwOOwwOOwshO_________',
'______bwOOOOOOOOOOOOwb__________',
'_______bOOOOOOOOOOOOb___________',
'_______bwwwwwbbwwwwwb___________',
'______bwwwwwwbbwwwwwwb__________',
'______bwwLwwwbbwwwLwwb__________',
'______bwwwwwwbbwwwwwwb__________',
'_______bggggbbbbggggb___________',
'_______bbbbbbbbbbbbbbb__________',
'_______bbbb______bbbbb_________',
'________________________________',
'________________________________',
];

const BATTER_SWING = [
'________________________________',
'________________________________',
'________________________________',
'________________________________',
'________________________________',
'____________OOOOOOO_____________',
'___________OOOOOOOOO____________',
'___________OOOOwwOOO____________',
'__________bOOOOwwOOOb___________',
'__________bOOOOOOOOOb___________',
'________bsssssssssssb___________',
'________bsPbsbsbPssb____________',
'________bsssssssssb_____________',
'_________bsshhhssb______________',
'_________bbmmmmbb_______________',
'_____RRRRROOOOOOOOOOO___________',
'____RRRROgwOOOOOOOOgwO__________',
'___RRRROgwwOOOOOOOOgwwO_________',
'___TT_OgwOOOOOOOOOOOgwO_________',
'_____OsswOOOOOOOOOOOwssO________',
'_____OhswOOwwOOwwOOOwshO________',
'______bwOOOOOOOOOOOOOwb_________',
'_______bOOOOOOOOOOOOOb__________',
'_______bwwwwwbbwwwwwb___________',
'______bwwwwwwbbwwwwwwb__________',
'______bwwLwwwbbwwwLwwb__________',
'______bwwwwwwbbwwwwwwb__________',
'_______bggggbbbbggggb___________',
'_______bbbbbbbbbbbbbbb__________',
'_______bbbb______bbbbb_________',
'________________________________',
'________________________________',
];

const CATCHER_ART = [
'________________________________',
'________________________________',
'________________________________',
'________________________________',
'________________________________',
'________________________________',
'________________________________',
'___________bbbbbbbbb____________',
'__________bbkkkkkkkbb___________',
'__________bkbwbwbwbkb___________',
'__________bkkkkkkkkbb___________',
'__________bkbwbwbwbkb___________',
'__________bbkkkkkkkbb___________',
'__________bbbbbbbbbb____________',
'________OOOOOOOOOOOOOO__________',
'_______OOOkkOOOOOOkkOOO_________',
'______RRROOkkOOOOkkOOORR________',
'______RRROOOOOOOOOOOORRb________',
'_______ROOOOOOOOOOOOOOR_________',
'________bOOOOOOOOOOOOb__________',
'________bOOOOOOOOOOOOb__________',
'______bwwwwb____bwwwwb__________',
'_____bwwwwwb____bwwwwwb_________',
'_____bwwwwwb____bwwwwwb_________',
'_____bgggggb____bgggggb_________',
'______bbbbb______bbbbb__________',
'______bbbb________bbbb_________',
'________________________________',
'________________________________',
'________________________________',
'________________________________',
'________________________________',
];

const UMPIRE_ART = [
'________________________________',
'________________________________',
'____________bbbbbb______________',
'___________bbbbbbbb_____________',
'__________bbbbbbbbb_____________',
'__________bbbbbb________________',
'_________bsssssssb______________',
'_________bsPbsbPsb______________',
'_________bsssssssb______________',
'__________bshhhsb_______________',
'__________bbmmbb________________',
'________bbbbbbbbbbbb____________',
'_______bkkkkkkkkkkkbb___________',
'______bkkwwkkkkkwwkkb___________',
'______bkkwwkkkkkwwkkb___________',
'______bkkkkkkkkkkkkb____________',
'_______bkkkkkkkkkkkb____________',
'________bkkkkkkkkkkb____________',
'________bkkkkkkkkkb_____________',
'________bkkkkkkkkkb_____________',
'________bkkkkbbkkkkb____________',
'_______bkkkkbbkkkkkb____________',
'_______bkkkkbbkkkkkb____________',
'_______bkkkkbbkkkkkb____________',
'________bRRRbbbbRRRb____________',
'________bRRRb__bRRRb____________',
'________bbbb____bbbb____________',
'________________________________',
'________________________________',
'________________________________',
'________________________________',
'________________________________',
];

const BALL_ART = [
'______',
'_wwww_',
'wrwwrw',
'wrwwrw',
'_wwww_',
'______',
];

function renderPixelArt(art: string[], pixelSize: number) {
  const rects: React.ReactElement[] = [];
  for (let y = 0; y < art.length; y++) {
    for (let x = 0; x < art[y].length; x++) {
      const ch = art[y][x];
      if (C[ch]) {
        rects.push(<rect key={`${x}-${y}`} x={x * pixelSize} y={y * pixelSize} width={pixelSize} height={pixelSize} fill={C[ch]} />);
      }
    }
  }
  return rects;
}

export const PixelPitcher: React.FC<{ size?: number; className?: string }> = ({ size = 80, className }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className} shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    {renderPixelArt(PITCHER, 4)}
  </svg>
);

export const PixelBatter: React.FC<{ size?: number; className?: string; isSwinging?: boolean }> = ({ size = 80, className, isSwinging }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className} shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    {renderPixelArt(isSwinging ? BATTER_SWING : BATTER, 4)}
  </svg>
);

export const PixelCatcher: React.FC<{ size?: number; className?: string }> = ({ size = 70, className }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className} shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    {renderPixelArt(CATCHER_ART, 4)}
  </svg>
);

export const PixelUmpire: React.FC<{ size?: number; className?: string }> = ({ size = 75, className }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className} shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    {renderPixelArt(UMPIRE_ART, 4)}
  </svg>
);

export const PixelBall: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    {renderPixelArt(BALL_ART, 4)}
  </svg>
);
