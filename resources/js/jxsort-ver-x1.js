/*
//------------------ JXSORT  ------------------ //
version( 버전 ) : x1
date ( 날짜 ) : 2019.05
*/

function JXSORT(obj, options) {
    this.defaults = {
        bPercent: false, // 데이터 요소가 가로 퍼센트 인지를 봐야함.(** jx-box의 가로 사이즈를 %로 주면 true로 꼭 줘야함)
        bSequence: false, //보이거나 움직일대 순차적(true) 또는 동시적(false)이냐 보여주는것
        sFilterName: '', //jx-box에 클래스명으로 정렬.red blue 처럼 클래스로 컬러별, 이름별 구분가능
        sAlign: 'ascending', // 기본 데이터로 정렬을 하기위함 ascending : 오름차순 , descending : 내림차순  ( 필터를 통해서도 사용 )
        bGroup: false // title을 이용하여 그룹별로 모아서 정렬
    }

    $.extend(true, this.defaults, options);

    this.nMore = 0;
    this.$obj = obj // $('.jx-grid .jx-box');
    this.oriArr = []; //정렬해야할 기본 객체를 배열에 담고
    this.sortArr = []; //객체의 위치와 높이를 가지고 재정렬 하기 위해 배열에 다시 담고
    this.nAdd = 0; //초기화 때문에
    this.nPrevCut; //가로로 몇개를 나열할것인가
    this.nCurrCut = 0; //가로로 몇개를 나열할것인가
    this.nDelay = 0;
    this.bFilterChange = false;
    this.bMore = false;
    this.bResize = false;
    this.bDestroy = false;
    this.bDocumentHeight = false;
    /*
    this.mgt = parseInt(this.$obj.find('> .jx-list > .jx-warp > .jx-box').css('margin-top'));
    this.mgr = parseInt(this.$obj.find('> .jx-list > .jx-warp > .jx-box').css('margin-right'));
    this.mgl = parseInt(this.$obj.find('> .jx-list > .jx-warp > .jx-box').css('margin-left'));
    */
    //this.nObjWidth = 200 + this.mgr + this.mgl; //나중에 객체의 사이즈를 넣어자
    this.nObjWidth = this.$obj.find('.jx-list .jx-warp .jx-box').eq(0).outerWidth(true); //박스의 가로 사이즈
    this.nObjHeight = 0; //컨테이너 총 높이

    this.init();

}

JXSORT.prototype.init = function() {
  var _this = this;
  this.bMore = this.bDestroy = false;
  this.bResize = true;

  $(window).resize( function() {
    if ( _this.bResize )
    {
      _this.resize()
    }
   })

  $(window).trigger('resize');


  if( this.$obj.find('.btn-filter').length > 0 ) {
    this.btnfilter();
  }

  if( this.$obj.find('.btn-align').length > 0 ) {
    this.btnalign();
  }

  if( this.$obj.find('.btn-groupview').length > 0 ) {
    this.btngroupview();
  }

};


JXSORT.prototype.destroy = function() {
  var _this = this;
  this.bDestroy = true;
  //$(window).unbind();
  this.bResize = false;
  this.$obj.find('.btn-filter, .btn-align, .btn-groupview').unbind();
  this.$obj.find('.jx-list .jx-warp').css('height','auto');
  this.$obj.find('.jx-list .jx-warp .jx-box').addClass('view').removeClass('on').css({
    left: 'auto'
    ,top: 'auto'
  });

}//btnfilter

JXSORT.prototype.btnfilter = function() {
  var _this = this;

  this.$obj.find('.btn-filter').on('click', function(e) {
      //console.log('red11')
      //jxsort.setFilter( $(this).attr('class') );
      _this.setFilter( $(this).attr('class') );
  });
}//btnfilter

JXSORT.prototype.btnalign = function() {
  var _this = this;
  this.$obj.find('.btn-align').on('click', function(e) {
      _this.setAlign( $(this).attr('class') );
  });
}//btnalign

JXSORT.prototype.btngroupview = function() {
  var _this = this;
  this.$obj.find('.btn-groupview').on('click', function(e) {
      //console.log('red11')
      //jxsort.setFilter( $(this).attr('class') );
      if ($(this).hasClass('ascending') ) {
          _this.setGroup('ascending');
      } else {
          _this.setGroup('descending');
      }
  });
}//btngroupview

JXSORT.prototype.resize = function() {

    var _this = this;

    var nGridWidth = this.$obj.find('> .jx-list > .jx-warp').innerWidth();
    //var nGridWidth = this.$obj.innerWidth();

    this.nObjWidth = this.$obj.find('.jx-list .jx-warp .jx-box').eq(0).outerWidth();
    //console.log('this.nObjWidth ' , this.nObjWidth)

    this.oriArr = [];
    this.sortArr = []; //초기화 때문에
    this.nAdd = this.nObjHeight = _this.nIndex = 0; //초기화 때문에
    this.nPrevCut = this.nCurrCut;
    this.nCurrCut = (!this.defaults.bPercent) ? Math.floor(nGridWidth / this.nObjWidth) : Math.round(nGridWidth / this.nObjWidth)

    //순차적으로 보여야할때 보여지는 속도값을 구하기 위해 토탈을 구함
    if (this.defaults.sFilterName === undefined || this.defaults.sFilterName === '' || this.defaults.sFilterName === 'all' ) {
        this.nTotal = this.$obj.find('> .jx-list > .jx-warp > .jx-box').length;
    } else {
        this.nTotal = this.$obj.find('> .jx-list > .jx-warp > .jx-box.' + this.defaults.sFilterName).length;
    }


    if (this.nPrevCut !== this.nCurrCut || this.defaults.bPercent || !_this.bFilterChange || !_this.bMore) {
        //console.log('변화를 줘야할때만  ', this.sortArr)

        _this.bFilterChange = _this.bMore = true;

        //그룹별 또는 넘버로 정렬하여 넣는다.
        this.$obj.find('> .jx-list > .jx-warp > .jx-box').each(function(i, e) {
            _this.oriArr.push($(this));

            _this.oriArr.sort( function(next, curr) {

                //1. 숫자로 재정렬할때
                var n //= parseInt(next.find('.num').text());
                var c //= parseInt(curr.find('.num').text());

                if (!_this.defaults.bGroup) {
                    n = parseInt(next.find('.num').text());
                    c = parseInt(curr.find('.num').text());
                } else {
                    n = next.find('.title').text();
                    c = curr.find('.title').text();
                }

                if (_this.defaults.sAlign === 'ascending') {
                    return n < c ? -1 : 1;
                } else {
                    return n > c ? -1 : 1;
                }
            });
        });

        _this.oriArr.forEach(function(e, i) {

            //console.log(i)
            /*
            _this.nIndex  이건 아래보면 필터조건이 되면 숫자를 증가시킨다. 그래서
            그 숫자를 가지고 컷을 놔눈다.
            */
            if (_this.oriArr[i].hasClass(_this.defaults.sFilterName) || _this.defaults.sFilterName === undefined || _this.defaults.sFilterName === '' || _this.defaults.sFilterName === 'all' ) {
                if (_this.nIndex < _this.nCurrCut) {
                    //첫째 줄 라인만
                    e.data({ 'left': _this.nIndex * _this.nObjWidth, 'top': 0 });
                    e.css({ 'left': e.data('left'), "top": e.data('top') ,'margin':0});
                    e.addClass('on');
                    _this.sortArr.push(e);

                } else {
                    //위치 + 높이를 이용하여 재정렬
                    _this.sortArr.sort( function (next, curr) {
                        var n = next.data('top') + next.outerHeight();
                        var c = curr.data('top') + curr.outerHeight();
                        return n < c ? -1 : 1;
                    });

                    var prevOBJ = _this.sortArr[_this.nAdd]; //어떤 객체에 붙어야할지를 담는다
                    var prevL = prevOBJ.data('left'); //prevOBJ.position().left;
                    var prevT = prevOBJ.data('top');
                    var prevW = prevOBJ.data('width');
                    var prevH = prevOBJ.outerHeight();

                    e.data({ 'left': prevL  , "top": prevT + prevH });
                    e.css({ 'left': e.data('left'), "top": e.data('top') , 'margin':0});

                    e.addClass('on');
                    _this.sortArr.push(e);
                    _this.nAdd++;
                    //_this.nObjHeight = ( _this.nObjHeight >  prevT + prevH ) ? _this.nObjHeight : prevT + prevH;
                }

                //순서대로 보이게 할것인가
                if (_this.defaults.bSequence) {
                  //console.log ( "-------------------------- " ,  _this.nIndex , _this.nMore , _this.nIndex % _this.nMore )
                    _this.nDelay = (_this.nIndex / (_this.nTotal)).toFixed(2) + 's';
                    e.css('transition-delay', _this.nDelay );
                }

                _this.nObjHeight = (_this.nObjHeight > e.data('top') + e.outerHeight()) ? _this.nObjHeight : e.data('top') + e.outerHeight();
                _this.nIndex++;

                e.addClass('view');
            } else {

                //클래스 네임이 있으면 없으면 보여주지 말고
                //_this.nIndex =0;
                //e.css({ 'display': 'none', 'opacity': 0 });
                e.removeClass('view');
            }
        });

        //jx-warp 전체 높이를 구하고
        this.$obj.find('> .jx-list > .jx-warp').css('height', _this.nObjHeight);

        /*
        객체를 붙는 과정에서 계속 추가를 할경우 붙고나서 스크롤바가 생기면
        스크롤바 때문에 가로 사이즈가 달라지기 때문에 리사이징을 다시 해야한다.
        */
        //setTimeout( () => {
          if ( $(document).height() > $('body').height() ) {
            if( !_this.bDocumentHeight ) {
              _this.bDocumentHeight = true;
              //console.log('aa')
              _this.resize();
              _this.$obj.find('> .jx-list > .jx-warp').addClass('on');
            }
          } else {
            _this.bDocumentHeight = false;
          }
        //}, 300);
        _this.nMore = 0;
    }
} //resize

JXSORT.prototype.setFilter = function(sClassName) {
    /*sClassName.some(item => {
        //하나라도 문자가 존재하면 등록
        console.log('item ' , item , +item.charCodeAt(0) )
        // if (+item.charCodeAt(0) != 32) {
        //   return true;
        // }
      });*/
    var aClass = sClassName.split(' ');
    var aClassFilters = aClass.filter( function(e) {
        if (e !== '' && e !== 'jx-btns' && e !== 'btn-filter') {
            return e;
        }
    });

    this.bFilterChange = false;
    this.defaults.sFilterName = ( aClassFilters[0] != undefined ) ? aClassFilters[0].toLowerCase() : '';
    this.resize();
} //setFilter


JXSORT.prototype.setAlign = function(sClassName) {

    var aClass = sClassName.split(' ');
    var aClassFilters = aClass.filter( function(e) {
        if (e !== '' && e !== 'jx-btns' && e !== 'btn-align') {
            return e;
        }
    });

    this.bFilterChange = this.defaults.bGroup = false;
    this.sAlignName = (aClassFilters[0] != undefined) ? aClassFilters[0].toLowerCase() : 'ascending';
    this.defaults.sAlign = this.sAlignName;
    this.resize();

} //setAlign

//그룹별로 보이게 하는것
JXSORT.prototype.setGroup = function(sAscDes) {
    this.bMore = false;
    this.defaults.bGroup = true;
    //this.defaults.sFilterName = '';
    this.defaults.sAlign = sAscDes.toLowerCase();
    this.resize();
} //setGroup

//더보기
JXSORT.prototype.setMore = function($box , nMore) {
  var _this = this;
  _this.$obj.find('> .jx-list > .jx-warp').append($box);

  this.nMore++;

  //밖에서 몇개씩 보여주는지를 판단해서 다 붙이면 리사이징 하기 위함
  if (this.nMore % nMore == 0)
  {
    this.bMore = false;
    if( !this.bDestroy ) {
      //setTimeout(function(){
       _this.resize();
      //}, 3000)
    }
  }

  //console.log('nObjWidth ===ddd ' , _this.$obj.find('.jx-list .jx-warp .jx-box').outerWidth(true) )
} //setMore

