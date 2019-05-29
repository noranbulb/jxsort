/*
//------------------ JXSORT  ------------------ //
version( ���� ) : x1
date ( ��¥ ) : 2019.05
*/

function JXSORT(obj, options) {
    this.defaults = {
        bPercent: false, // ������ ��Ұ� ���� �ۼ�Ʈ ������ ������.(** jx-box�� ���� ����� %�� �ָ� true�� �� �����)
        bSequence: false, //���̰ų� �����ϴ� ������(true) �Ǵ� ������(false)�̳� �����ִ°�
        sFilterName: '', //jx-box�� Ŭ���������� ����.red blue ó�� Ŭ������ �÷���, �̸��� ���а���
        sAlign: 'ascending', // �⺻ �����ͷ� ������ �ϱ����� ascending : �������� , descending : ��������  ( ���͸� ���ؼ��� ��� )
        bGroup: false // title�� �̿��Ͽ� �׷캰�� ��Ƽ� ����
    }

    $.extend(true, this.defaults, options);

    this.nMore = 0;
    this.$obj = obj // $('.jx-grid .jx-box');
    this.oriArr = []; //�����ؾ��� �⺻ ��ü�� �迭�� ���
    this.sortArr = []; //��ü�� ��ġ�� ���̸� ������ ������ �ϱ� ���� �迭�� �ٽ� ���
    this.nAdd = 0; //�ʱ�ȭ ������
    this.nPrevCut; //���η� ��� �����Ұ��ΰ�
    this.nCurrCut = 0; //���η� ��� �����Ұ��ΰ�
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
    //this.nObjWidth = 200 + this.mgr + this.mgl; //���߿� ��ü�� ����� �־���
    this.nObjWidth = this.$obj.find('.jx-list .jx-warp .jx-box').eq(0).outerWidth(true); //�ڽ��� ���� ������
    this.nObjHeight = 0; //�����̳� �� ����

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
    this.sortArr = []; //�ʱ�ȭ ������
    this.nAdd = this.nObjHeight = _this.nIndex = 0; //�ʱ�ȭ ������
    this.nPrevCut = this.nCurrCut;
    this.nCurrCut = (!this.defaults.bPercent) ? Math.floor(nGridWidth / this.nObjWidth) : Math.round(nGridWidth / this.nObjWidth)

    //���������� �������Ҷ� �������� �ӵ����� ���ϱ� ���� ��Ż�� ����
    if (this.defaults.sFilterName === undefined || this.defaults.sFilterName === '' || this.defaults.sFilterName === 'all' ) {
        this.nTotal = this.$obj.find('> .jx-list > .jx-warp > .jx-box').length;
    } else {
        this.nTotal = this.$obj.find('> .jx-list > .jx-warp > .jx-box.' + this.defaults.sFilterName).length;
    }


    if (this.nPrevCut !== this.nCurrCut || this.defaults.bPercent || !_this.bFilterChange || !_this.bMore) {
        //console.log('��ȭ�� ����Ҷ���  ', this.sortArr)

        _this.bFilterChange = _this.bMore = true;

        //�׷캰 �Ǵ� �ѹ��� �����Ͽ� �ִ´�.
        this.$obj.find('> .jx-list > .jx-warp > .jx-box').each(function(i, e) {
            _this.oriArr.push($(this));

            _this.oriArr.sort( function(next, curr) {

                //1. ���ڷ� �������Ҷ�
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
            _this.nIndex  �̰� �Ʒ����� ���������� �Ǹ� ���ڸ� ������Ų��. �׷���
            �� ���ڸ� ������ ���� ������.
            */
            if (_this.oriArr[i].hasClass(_this.defaults.sFilterName) || _this.defaults.sFilterName === undefined || _this.defaults.sFilterName === '' || _this.defaults.sFilterName === 'all' ) {
                if (_this.nIndex < _this.nCurrCut) {
                    //ù° �� ���θ�
                    e.data({ 'left': _this.nIndex * _this.nObjWidth, 'top': 0 });
                    e.css({ 'left': e.data('left'), "top": e.data('top') ,'margin':0});
                    e.addClass('on');
                    _this.sortArr.push(e);

                } else {
                    //��ġ + ���̸� �̿��Ͽ� ������
                    _this.sortArr.sort( function (next, curr) {
                        var n = next.data('top') + next.outerHeight();
                        var c = curr.data('top') + curr.outerHeight();
                        return n < c ? -1 : 1;
                    });

                    var prevOBJ = _this.sortArr[_this.nAdd]; //� ��ü�� �پ�������� ��´�
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

                //������� ���̰� �Ұ��ΰ�
                if (_this.defaults.bSequence) {
                  //console.log ( "-------------------------- " ,  _this.nIndex , _this.nMore , _this.nIndex % _this.nMore )
                    _this.nDelay = (_this.nIndex / (_this.nTotal)).toFixed(2) + 's';
                    e.css('transition-delay', _this.nDelay );
                }

                _this.nObjHeight = (_this.nObjHeight > e.data('top') + e.outerHeight()) ? _this.nObjHeight : e.data('top') + e.outerHeight();
                _this.nIndex++;

                e.addClass('view');
            } else {

                //Ŭ���� ������ ������ ������ �������� ����
                //_this.nIndex =0;
                //e.css({ 'display': 'none', 'opacity': 0 });
                e.removeClass('view');
            }
        });

        //jx-warp ��ü ���̸� ���ϰ�
        this.$obj.find('> .jx-list > .jx-warp').css('height', _this.nObjHeight);

        /*
        ��ü�� �ٴ� �������� ��� �߰��� �Ұ�� �ٰ��� ��ũ�ѹٰ� �����
        ��ũ�ѹ� ������ ���� ����� �޶����� ������ ������¡�� �ٽ� �ؾ��Ѵ�.
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
        //�ϳ��� ���ڰ� �����ϸ� ���
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

//�׷캰�� ���̰� �ϴ°�
JXSORT.prototype.setGroup = function(sAscDes) {
    this.bMore = false;
    this.defaults.bGroup = true;
    //this.defaults.sFilterName = '';
    this.defaults.sAlign = sAscDes.toLowerCase();
    this.resize();
} //setGroup

//������
JXSORT.prototype.setMore = function($box , nMore) {
  var _this = this;
  _this.$obj.find('> .jx-list > .jx-warp').append($box);

  this.nMore++;

  //�ۿ��� ��� �����ִ����� �Ǵ��ؼ� �� ���̸� ������¡ �ϱ� ����
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

