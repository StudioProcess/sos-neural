


function saveTiles(_renderer, _scene, _camera, _tiles) {
  var tileRenderer = _renderer;
  var tileScene = _scene;
  var tileCamera = _camera;
  var num_tiles = _tiles;
  var NUM_TILES = 2;

  num_tiles = num_tiles !== undefined ? num_tiles : NUM_TILES;

  if (!tileRenderer || !tileScene || !tileCamera) {
    console.warn('tilesaver: Please use init() to set up renderer, scene and camera');
    return;
  }

  if (num_tiles < 1) {
    console.warn('tilesaver: number of tiles needs to be > 0');
    return;
  }

  var timestamp = new Date().toISOString();
  var tileWidth = tileRenderer.domElement.width;
  var tileHeight = tileRenderer.domElement.height;
  var fullWidth = tileWidth * num_tiles;
  var fullHeight = tileHeight * num_tiles;
  console.log(tileWidth, tileHeight, fullWidth, fullHeight);

  var targetCanvas = document.createElement("canvas");
  targetCanvas.width = fullWidth;
  targetCanvas.height = fullHeight;
  var targetContext = targetCanvas.getContext("2d");

  for (var ty = 0; ty < num_tiles; ty++) {
    for (var tx = 0; tx < num_tiles; tx++) {
      var offsetX = tx * tileWidth;
      var offsetY = ty * tileHeight;
      tileCamera.setViewOffset(fullWidth, fullHeight, offsetX, offsetY, tileWidth, tileHeight);
      tileRenderer.render(tileScene, tileCamera);
      // save current tile
      targetContext.drawImage(tileRenderer.domElement, offsetX, offsetY);
    }
  }
  var canvas = document.getElementById('canvas-container');

  tileCamera.clearViewOffset();
  filename = targetCanvas, timestamp + '_' + fullWidth + 'x' + fullHeight + '.png';

    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

  });
}
//# sourceMappingURL=tilesaver_es5.js.map
