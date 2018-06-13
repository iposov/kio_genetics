import * as Settings from "./../settings";

export default class ChainElement {
  constructor(view, id) {
    /** @param {Number} num */
    let convertWithWidthFill = num => {
      let str = num.toString(view.elemPow);
      str = "0".repeat(view.elemLen - str.length) + str;
      return Settings.textMode === TextModes.DIGIT ? str :
        str.split('').map(val => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(parseInt(val, view.elemPow))).join('');
    };

    this._view = view;
    this._text = convertWithWidthFill(id);
    this._container = new Rectangle(Settings.BLOCK_WIDTH*view.elemLen, Settings.ELEMENT_HEIGHT, "White", "Black");

    let delimiter = new createjs.Shape();
    this._stroke_cmd = delimiter.graphics.setStrokeStyle(1).beginStroke("Black").command;
    for(let i=0; i<view.elemLen; i++) {
      let rect = new Container(Settings.BLOCK_WIDTH, Settings.ELEMENT_HEIGHT);
      rect.x = Settings.BLOCK_WIDTH*i;

      let label = new Label({
        text:this._text[i],
        size:15,
        font:"Lucida Console",
        color:"black"
        //fontOptions:"bold"
      });
      label.center(rect);

      if(i > 0) {
        delimiter.graphics.moveTo(Settings.BLOCK_WIDTH*i, 0).lineTo(Settings.BLOCK_WIDTH*i, Settings.ELEMENT_HEIGHT);
        this._container.addChild(delimiter);
      }

      rect.addTo(this._container);
    }

    this.active = true;
  }

  get container() {
    return this._container;
  }

  set active(val) {
    if(this._active !== val)
    {
      this._active = val;
      this.state = States.INDEFINITE;
      if(val) {
        this._onpressmove_wrap = this._container.on("pressmove",  () => this._onpressmove(this));
        this._onpressup_wrap = this._container.on("pressup", () => this._onpressup(this));
        this._container.drag();
      }
      else {
        this._container.off("pressmove", this._onpressmove_wrap);
        this._container.off("pressup", this._onpressup_wrap);
        this._container.noDrag();
      }
    }
  }

  set state(val) {
    this._stroke_cmd.style = this._container.borderColor = val;
  }

  _movToStage(elem) {
    let obj = elem._container;
    if (this._view.frame.stage.getChildIndex(obj) === -1) {
      obj.addTo(this._view.frame.stage);
      obj.mov(this._view.layout.desiredX, Settings.MARGIN);
    }
  };

  _onpressup(elem) {
    let obj = elem._container;
    obj.color = "rgba(255,255,255,1)";
    if (this._view.layout.hitTest(obj)) {
      if (this._view.layout.container.getChildIndex(obj) === -1) {
        obj.addTo(this._view.layout.container);
        obj.mov(-this._view.layout.desiredX, -Settings.MARGIN);
      }

      this._view.layout.stick(elem);
    }
  };

  _onpressmove(elem) {
    let obj = elem._container;
    obj.color = "rgba(255,255,255,0.3)";
    this._movToStage(elem);
  };
}

// Состояния элемента
export const States = Object.freeze({
  INDEFINITE: "rgba(0,0,0,1)",
  OK: "rgba(0,255,0,1)",
  BAD: "rgba(255,0,0,1)"
});

// Режим отрисовки слова
export const TextModes = Object.freeze({
  LETTER: Symbol("letter"),
  DIGIT: Symbol("digit")
});