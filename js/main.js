$(document).ready(function () {
    // start split
    console.clear();
    const s = Splitting();
    console.clear();
    Splitting({
      target: '.tiler',
      by: 'cells',
      rows: 3,
      columns: 3,
      image: true
    });
    // end split
    // start btn
    $(function() {
      // Vars
      let pointsA = [],
        pointsB = [],
        $canvas = null,
        canvas = null,
        context = null,
        vars = null,
        points = 8,
        viscosity = 20,
        mouseDist = 70,
        damping = 0.05,
        showIndicators = false;
        mouseX = 0,
        mouseY = 0,
        relMouseX = 0,
        relMouseY = 0,
        mouseLastX = 0,
        mouseLastY = 0,
        mouseDirectionX = 0,
        mouseDirectionY = 0,
        mouseSpeedX = 0,
        mouseSpeedY = 0;
      /**
       * Get mouse direction
       */
      function mouseDirection(e) {
        if (mouseX < e.pageX)
          mouseDirectionX = 1;
        else if (mouseX > e.pageX)
          mouseDirectionX = -1;
        else
          mouseDirectionX = 0;
        if (mouseY < e.pageY)
          mouseDirectionY = 1;
        else if (mouseY > e.pageY)
          mouseDirectionY = -1;
        else
          mouseDirectionY = 0;
        mouseX = e.pageX;
        mouseY = e.pageY;
        relMouseX = (mouseX - $canvas.offset().left);
        relMouseY = (mouseY - $canvas.offset().top);
      }
      $(document).on('mousemove', mouseDirection);
    
      /**
       * Get mouse speed
       */
      function mouseSpeed() {
        mouseSpeedX = mouseX - mouseLastX;
        mouseSpeedY = mouseY - mouseLastY;
        mouseLastX = mouseX;
        mouseLastY = mouseY;
        setTimeout(mouseSpeed, 50);
      }
      mouseSpeed();
      /**
       * Init button
       */
      function initButton() {
        // Get button
        let button = $('.btn-liquid');
        let buttonWidth = button.width();
        let buttonHeight = button.height();
        // Create canvas
        $canvas = $('<canvas></canvas>');
        button.append($canvas);
        canvas = $canvas.get(0);
        canvas.width = buttonWidth+100;
        canvas.height = buttonHeight+100;
        context = canvas.getContext('2d');
        // Add points
        let x = buttonHeight/2;
        for(let j = 1; j < points; j++) {
          addPoints((x+((buttonWidth-buttonHeight)/points)*j), 0);
        }
        addPoints(buttonWidth-buttonHeight/5, 0);
        addPoints(buttonWidth+buttonHeight/10, buttonHeight/2);
        addPoints(buttonWidth-buttonHeight/5, buttonHeight);
        for(let j = points-1; j > 0; j--) {
          addPoints((x+((buttonWidth-buttonHeight)/points)*j), buttonHeight);
        }
        addPoints(buttonHeight/5, buttonHeight);
        addPoints(-buttonHeight/10, buttonHeight/2);
        addPoints(buttonHeight/5, 0);
        // Start render
        renderCanvas();
      }
      /**
       * Add points
       */
      function addPoints(x, y) {
        pointsA.push(new Point(x, y, 1));
        pointsB.push(new Point(x, y, 2));
      }
    
      /**
       * Point
       */
      function Point(x, y, level) {
        this.x = this.ix = 50+x;
        this.y = this.iy = 50+y;
        this.vx = 0;
        this.vy = 0;
        this.cx1 = 0;
        this.cy1 = 0;
        this.cx2 = 0;
        this.cy2 = 0;
        this.level = level;
      }
      Point.prototype.move = function() {
        this.vx += (this.ix - this.x) / (viscosity*this.level);
        this.vy += (this.iy - this.y) / (viscosity*this.level);
        let dx = this.ix - relMouseX,
          dy = this.iy - relMouseY;
        let relDist = (1-Math.sqrt((dx * dx) + (dy * dy))/mouseDist);
        // Move x
        if ((mouseDirectionX > 0 && relMouseX > this.x) || (mouseDirectionX < 0 && relMouseX < this.x)) {
          if (relDist > 0 && relDist < 1) {
            this.vx = (mouseSpeedX / 4) * relDist;
          }
        }
        this.vx *= (1 - damping);
        this.x += this.vx;
    
        // Move y
        if ((mouseDirectionY > 0 && relMouseY > this.y) || (mouseDirectionY < 0 && relMouseY < this.y)) {
          if (relDist > 0 && relDist < 1) {
            this.vy = (mouseSpeedY / 4) * relDist;
          }
        }
        this.vy *= (1 - damping);
        this.y += this.vy;
      };
      function renderCanvas() {
        // rAF
        rafID = requestAnimationFrame(renderCanvas);
        // Clear scene
        context.clearRect(0, 0, $canvas.width(), $canvas.height());
        context.fillStyle = '#fff';
        context.fillRect(0, 0, $canvas.width(), $canvas.height());
        // Move points
        for (var i = 0; i <= pointsA.length - 1; i++) {
          pointsA[i].move();
          pointsB[i].move();
        }
        // Create dynamic gradient
        let gradientX = Math.min(Math.max(mouseX - $canvas.offset().left, 0), $canvas.width());
        let gradientY = Math.min(Math.max(mouseY - $canvas.offset().top, 0), $canvas.height());
        let distance = Math.sqrt(Math.pow(gradientX - $canvas.width()/2, 2) + Math.pow(gradientY - $canvas.height()/2, 2)) / Math.sqrt(Math.pow($canvas.width()/2, 2) + Math.pow($canvas.height()/2, 2));
        let gradient = context.createRadialGradient(gradientX, gradientY, 300+(300*distance), gradientX, gradientY, 0);
        gradient.addColorStop(0, '#ec1d24');
        gradient.addColorStop(1, '#ec1d24');
        // Draw shapes
        let groups = [pointsA, pointsB]
        for (let j = 0; j <= 1; j++) {
          let points = groups[j];
          if (j == 0) {
            // Background style
            context.fillStyle = '#000';
          } else {
            // Foreground style
            context.fillStyle = gradient;
          }
          context.beginPath();
          context.moveTo(points[0].x, points[0].y);
          for (let i = 0; i < points.length; i++) {
            let p = points[i];
            let nextP = points[i + 1];
            let val = 30*0.552284749831;
            if (nextP != undefined) {
                p.cx1 = (p.x+nextP.x)/2;
                p.cy1 = (p.y+nextP.y)/2;
                p.cx2 = (p.x+nextP.x)/2;
                p.cy2 = (p.y+nextP.y)/2;
                context.bezierCurveTo(p.x, p.y, p.cx1, p.cy1, p.cx1, p.cy1);
            } else {
                nextP = points[0];
                p.cx1 = (p.x+nextP.x)/2;
                p.cy1 = (p.y+nextP.y)/2;
                context.bezierCurveTo(p.x, p.y, p.cx1, p.cy1, p.cx1, p.cy1);
            }
          }
          // context.closePath();
          context.fill();
        }
        if (showIndicators) {
          // Draw points
          context.fillStyle = '#000';
          context.beginPath();
          for (let i = 0; i < pointsA.length; i++) {
            let p = pointsA[i];
            context.rect(p.x - 1, p.y - 1, 2, 2);
          }
          context.fill();
          // Draw controls
          context.fillStyle = '#f00';
          context.beginPath();
          for (let i = 0; i < pointsA.length; i++) {
            let p = pointsA[i];
            context.rect(p.cx1 - 1, p.cy1 - 1, 2, 2);
            context.rect(p.cx2 - 1, p.cy2 - 1, 2, 2);
          }
          context.fill();
        }
      }
      // Init
      initButton();
    });
    // end btn
});
// start drag
const position = { x: 0, y: 0 }

interact('.shield').draggable({
  listeners: {
    start (event) {
      console.log(event.type, event.target)
    },
    move (event) {
      position.x += event.dx
      position.y += event.dy
      event.target.style.transform =
        `translate(${position.x}px, ${position.y}px)`
    },
  }
})
interact('.shield')
  .resizable({
    edges: { top: true, left: true, bottom: true, right: true },
    listeners: {
      move: function (event) {
        let { x, y } = event.target.dataset
        x = (parseFloat(x) || 0) + event.deltaRect.left
        y = (parseFloat(y) || 0) + event.deltaRect.top
        Object.assign(event.target.style, {
          width: `${event.rect.width}px`,
          height: `${event.rect.height}px`,
          transform: `translate(${x}px, ${y}px)`
        })
        Object.assign(event.target.dataset, { x, y })
      }
    }
  })
// end drag
// start char
let lr = document.querySelector('[data-splitting]');
window.addEventListener('click',()=>{
  let newone = lr.cloneNode(true);
  lr.parentNode.replaceChild(newone, lr);
  lr = newone;
});
// end char
// start swiper
let swiper = new Swiper(".mySwiper", {
  slidesPerView: 3,
  spaceBetween: 30,
  freeMode: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});
// end swiper
    // start alert
    Swal.fire({
      title: 'WELCOME TO MARVEL STUDIOS',
      width: 600,
      padding: '2em',
      background: 'rgba(255, 255, 255, 0.8)',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
      backdrop: `
        url("/images/marvel.jpg")
        left top
        no-repeat
      `
    })
    // end alert
    // start dark mode
    let icon = document.getElementById("icon");
    icon.onclick = function() {
    document.body.classList.toggle("dark-theme");
    if(document.body.classList.contains("dark-theme")) {
        icon.src = "images/sun.png";
    }
    else {
        icon.src = "images/moon.png";
    }
}
  // end dark mode