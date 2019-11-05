jxsort
-
높이가 다른 객체를 원하는 순서대로 정렬하여 주는 플러그인이다.
제이쿼리와 imagesloaded.pkgd.js 플러그인을  `head 태그` 사이에 필수로 넣어야한다.
이때 중요한것은 imagesloaded.pkgd.js 플러그인이 제이쿼리보다 아래에 선언되어야 한다.
익스플로러 9이상부터 작동이 가능하지만 익스플로러 9는 부드럽게 움직이거나 나타나는 효과는 적용되지 않는다.
그리고 css 에 `html  {height: 100%; }
body { height: 100%; }` 필수로 넣어야 한다.

https://jxsort.netlify.com/

#### html

 ``` sh

 <div class="jx-grid">
    <div class="jx-list">
        <div class="jx-warp">
            <div class="jx-box jx-box-1">
                <a href="" class="jx-cont">
                    <span class="num">1</span>
                    <span class="title">bon</span>
                    <span class="info"><img src="./resources/imgs/thumb_1.jpg"></span>
                </a>
            </div>

        </div>
    </div>

    <div class="jx-sort-btn">
        <div>
            <button class="jx-btns btn-filter all">show all</button>
            <button class="jx-btns btn-filter bon ">bon 만 보이게</button>
            <button class="jx-btns btn-filter yezac">yezac만 보이게</button>
            <button class="jx-btns btn-filter carries">carries만 보이게</button>
        </div>
        <div>
            <button class="jx-btns btn-align descending">num descending 내림차순 3 2 1...</button>
            <button class="jx-btns btn-align ascending">num ascending 오름차순 ... 1 2 3</button>
        </div>
        <div>
            <button class="jx-btns btn-groupview descending">그룹별로 내림차순</button>
            <button class="jx-btns btn-groupview ascending">그룹별로 오름차순 </button>
        </div>
        <div>
            <button class="jx-btns btn-more">more</button>
        </div>
    </div>

</div>

````


#### javascript

```` sh
<head>
  <meta name="viewport" content="width=device-width, user-scalable=no, target-densityDpi=device-dpi">
  <link rel="stylesheet" type="text/css" href="resources/css/jxsort-ver-x1.css">
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js" type="text/javascript"></script>
  <script src="https://unpkg.com/imagesloaded@4/imagesloaded.pkgd.js"></script>
  <script src="resources/js/jxsort-ver-x1.js" type="text/javascript"></script>
</head>


<body>

..기본 슬라이드 객체 생략..

<script>
    ...
    jxsort = new JXSORT($('.jx-grid'), {});
    ...

    $(function(e) {

        $('.jx-sort-btn .btn-more').click(function(e){
            imgLoadMore();
        });

        //플러그인 기능을 다시 초기화
        $('.btn_create').on('click',function(e){
            jxsort.init();
        });

        //플러그인 기능을 없애고
        $('.btn_destroy').on('click',function(e){
            jxsort.destroy();
        });

    })
</script>

</body>

````


### Settings

Option | Type | Default | Description
------ | ---- | ------- | -----------
bPercent      |  boolean  |  false  | jx-box가 width 단위가 % 이면 true , px 이면 false이다 ( ** css에 %일때 꼭 true를 줘야함. )
bSequence   |  boolean  |  false  | jx-box를 붙이고 나서 보이거나 움직일때 순차적(true) 또는 동시적(false)이냐 보여주는것
sFilterName  |  string  | 0 |  jx-box에 추가적으로 붙는 클래스 명과 같은 클래스명을 가진 jx-box객체만 보여주고 싶을때 사용 `bon을 사용하면 처음부터 .jx-box.bon 이라 붙은 객체만 보이게 된다.`
bGroup        | boolean  | 0 |  jx-box 안에 .title 객체에 담긴 텍스트를 가지고 정렬을 오름차순으로 시작한다.


### Methods

Option | Argument | Description
------ | ------- | -----------
setFilter   |  sClassName: string  |  버튼에 클래스명`<button class="jx-btns btn-filter bon">`을 이용하여 검색할 클래스명을 찾아서  jx-box에 추가적으로 붙는 클래스 명과 같은 클래스명을 넘기면 클래스명과 같은 객체만 보여주게 된다
setAlign  |  sClassName:string   | 버튼에 클래스명`<button class="jx-btns btn-align descending">`을 이용하여 검색할 클래스명을 찾아서 ascending 값을 넘기면 오름차순 , descending값을 넘기면 내림차순으로 정렬이 된다.
setGroup  | sAscDes:string  |  jx-box 안에 .title 객체에 담긴 텍스트를 가지고 정렬을 오름차순 또는 내림차순으로 시작한다. `<button class="jx-btns btn-groupview descending">`
setMore    |  $box: $(html) , nMore : int  |  객체를 생성하여 추가를 할수 있다. 이건 외부에서 버튼을 만들어서 필요한 데이터를 만들고 넣어야하며, nMore는 추가를 할때 몇개씩 할것인지를 숫자를 넣으면 된다.




