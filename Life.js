if (Meteor.isClient) {

  Template.TheGame.onRendered(function () {
  //----------------------------------------------------------------------------

  describe('Observ object', function() {
    it('should return defined object', function() {
      expect(Life).toBeDefined();
    });
    it('check methods of object', function() {
      expect(Life.updateState).toBeDefined();
      expect(Life.copyGrid).toBeDefined();
    });
  });

  describe('Copy Grid for next generation and friends calculation', function() {
    it('Copy Grid 1 to Grid 2', function() {
      var grid1, grid2, grid3;
      grid1 = [[1, 2, 3, 4],[1, 2, 3, 4]];
      grid2 = [[0, 0, 0, 0],[0, 0, 0, 0]];
      grid3 = [[1, 2, 3, 4],[1, 2, 3, 4]];
      expect(Life.copyGrid(grid1, grid2, 2, 4)).toEqual(grid3);
    });
    it('Calculate friends', function() {
      var grid1 = [[0, 0, 0, 0, 0],[0, 0, 0, 0, 0],[0, 0, 0, 0, 0],[0, 0, 1, 0, 0],[0, 0, 1, 0, 0]];
      expect(calcFriends(3, 3, grid1, 5, 5, 0)).toEqual(2);
    });
  });

  describe('Canvas operations', function() {
    it('Getting cursor position function', function() {
      expect(getCursorPosition(event)).toBeTruthy();
    });
  });

  describe('Pressing buttons', function() {
    var spyEvent;
    it('Start\\Stop button trigger', function() {
      spyEvent = spyOnEvent('#controlLink', 'click');
      $('#controlLink').trigger( "click" );
      expect('click').toHaveBeenTriggeredOn('#controlLink');
      expect(spyEvent).toHaveBeenTriggered();
    });
    it('Clear button trigger', function() {
      spyEvent = spyOnEvent('#clearLink', 'click');
      $('#clearLink').trigger( "click" );
      expect($('#clearLink').length).toEqual(1);
      expect('click').toHaveBeenTriggeredOn('#clearLink');
      expect(spyEvent).toHaveBeenTriggered();
    });
  });

    Array.matrix = function (m, n, initial) {
      var a, i, j, mat = [];
      for (i = 0; i < m; i++) {
        a = [];
        for (j = 0; j < n; j++) {
          a[j] = 0;
        }
        mat[i] = a;
      };
      return mat;
      }
  //------------------------------------------------------------------------------
      var Life = {};

      Life.cell_size = 16;
      Life.X = 560;
      Life.Y = 400;
      Life.Width = Life.X / Life.cell_size;
      Life.Height = Life.Y / Life.cell_size;
      Life.Dead = 0;
      Life.Alive = 1;
      Life.Delay = 500;
      Life.Stopped = 0;
      Life.Running = 1;
      Life.Min = 2;
      Life.Max = 3;
      Life.Spawn = 3;
      Life.State = Life.Stopped;
      Life.Interval = 0;
      Life.Grid = Array.matrix(Life.Height, Life.Width, 0);
      Life.updateState = function() {
        var friends;
        var nextGenerationGrid = Array.matrix(Life.Height, Life.Width, 0);
        for (var h = 0; h < Life.Height; h++) {
          for (var w = 0; w < Life.Width; w++) {
            friends = calcFriends(h, w, Life.Grid, Life.Height, Life.Width, Life.Dead);
            if (Life.Grid[h][w] !== Life.Dead) {
              if ((friends >= Life.Min) && (friends <= Life.Max)) {
                nextGenerationGrid[h][w] = Life.Alive;
              }
            }
            else { if ( friends == Life.Spawn) {
              nextGenerationGrid[h][w] = Life.Alive;
              }
            }
          }
        }
        Life.copyGrid(nextGenerationGrid, Life.Grid, Life.Height, Life.Width);
      };

      calcFriends = function(y, x, grid, height, width, status) {
        var total = (grid[y][x] !== status) ? -1 : 0;
        for (var h = -1; h <= 1; h++) {
          for (var w = -1; w <= 1; w++) {
            if (grid[(height + (y + h)) % height]
                  [(width + (x + w)) % width] !== status) {
                    total++;
            }
          }
        }
        return total;
      };

      Life.copyGrid = function(source, destination, height, width) {
        for (var h = 0; h < height; h++) {
          for (var w = 0; w < width; w++) {
            destination[h][w] = source[h][w];
          }
        }
          return destination;
      };

      var gridCanvas = document.getElementById('grid');
      var controlLink = document.getElementById('controlLink');
      var clearLink = document.getElementById('clearLink');

      controlLink.onclick = function() {
        switch (Life.State) {
          case Life.Stopped:
            Life.Interval = setInterval(function () {
              update();
            }, Life.Delay);
            Life.State = Life.Running;
            break;
            default:
              clearInterval(Life.Interval);
            Life.State = Life.Stopped;
        }
      };

      clearLink.onclick = function() {
        Life.Grid = Array.matrix(Life.Height, Life.Width, 0);
        clearInterval(Life.Interval);
        Life.State = Life.Stopped;
        updateAnimations();
      };

      update = function() {
        Life.updateState();
        updateAnimations();
      }

      function updateAnimations() {
        for (var h = 0; h < Life.Height; h++){
          for (var w = 0; w < Life.Width; w++) {
            if (Life.Grid[h][w] === Life.Alive) {
              context.fillStyle = '#000';
            } else {
              context.fillStyle = '#eee';
            }
            context.fillRect(
              w * Life.cell_size + 1,
              h * Life.cell_size + 1,
              Life.cell_size - 1,
              Life.cell_size - 1);
          }
        }
      };
//---------------------------CANVAS---------------------------------------------
      if (gridCanvas.getContext) {
        function Cell( row, column) {
           this.row = row;
           this.column = column;
         };

        var context = gridCanvas.getContext('2d');
        var offset = Life.cell_size;
        for ( var x = 0; x < Life.X; x+=Life.cell_size) {
          context.moveTo(0.5 + x, 0);
          context.lineTo(0.5 + x, Life.Y);
        }
        for ( var y = 0; y < Life.Y; y+=Life.cell_size) {
          context.moveTo(0, 0.5 + y);
          context.lineTo(Life.X, 0.5 + y);
        }
        context.strokeStyle = '#fff';
        context.stroke();

        function canvasOnClickHandler (event) {
          var cell = getCursorPosition(event);
          var state = (Life.Grid[cell.row][cell.column] == Life.Alive) ? Life.Dead : Life.Alive;
          Life.Grid[cell.row][cell.column] = state;
          updateAnimations();
        };

        function getCursorPosition(event) {
          var x;
          var y;
          if (event.pageX || event.pageY) {
            x = event.pageX;
            y = event.pageY;
          }
          else {
            x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
          }

          x-= gridCanvas.offsetLeft;
          y-= gridCanvas.offsetTop;

          var cell = new Cell(Math.floor((y)/Life.cell_size), Math.floor((x)/Life.cell_size));
          return cell;
          };
      gridCanvas.addEventListener('click', canvasOnClickHandler, false);
    } else {
      alert('Canvas is not supported in your browser!');
    };

  });
};
