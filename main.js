// JavaScript Document
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js" />
/// <reference path="numeric-1.2.6.min.js" />


$(document).ready(function () {

	// 2dコンテキストを取得
	var canvas = $("#mViewCanvas");
	var cvs = document.getElementById('mViewCanvas');	// イベント設定用
	var context = canvas.get(0).getContext("2d");
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();
	
	
	// マウスポインタに関する変数
	var clickState = "Up";		// Up, Down
	var mousePos = [];

    // 初期状態はアウトライン作成
    var state = "init";


	/////////////////////////////////
	// 画像の読み込み
	//////////////////////////////////

	var img = new Image();
	var imgSc;
	var dx;
	var dy;
	var dw;
	var dh;

	$("#uploadFile").change(function () {
		// 選択されたファイルを取得
		var file=this.files[0];
		// 画像ファイル以外は処理中止
		if(!file.type.match(/^image\/(png|jpeg|gif)$/)) return;
		var reader=new FileReader();
		// File APIを使用し、ローカルファイルを読み込む
		reader.onload=function (evt) {
			// 画像がloadされた後に、canvasに描画する
			img.onload=function () {
				imgSc=0.9;
				if(img.height<img.width) {
					dx=0.5*(1-imgSc)*canvasWidth;
					dy=0.5*(canvasHeight-imgSc*img.height/img.width*canvasWidth);
					dw=imgSc*canvasWidth;
					dh=imgSc*canvasWidth*img.height/img.width;
				} else {
					dx=0.5*(canvasWidth-imgSc*img.width/img.height*canvasHeight);
					dy=0.5*(1-imgSc)*canvasHeight;
					dw=imgSc*canvasHeight*img.width/img.height;
					dh=imgSc*canvasHeight;
				}
				// 画像以外の変数の初期化
				state="init";
				mainloop();
			}
			// 画像のURLをソースに設定
			img.src=evt.target.result;
		}
		// ファイルを読み込み、データをBase64でエンコードされたデータURLにして返す
		reader.readAsDataURL(file);
	});

	// 最初の画像を選択
	//img.src = "miku.png?" + new Date().getTime();
	img.src = "donut.jpg?" + new Date().getTime();
	

	// 画像が読み込まれたときに実行
	img.onload=function () {
		imgSc=0.9;
		if(img.height<img.width) {
			dx=0.5*(1-imgSc)*canvasWidth;
			dy=0.5*(canvasHeight-imgSc*img.height/img.width*canvasWidth);
			dw=imgSc*canvasWidth;
			dh=imgSc*canvasWidth*img.height/img.width;
		} else {
			dx=0.5*(canvasWidth-imgSc*img.width/img.height*canvasHeight);
			dy=0.5*(1-imgSc)*canvasHeight;
			dw=imgSc*canvasHeight*img.width/img.height;
			dh=imgSc*canvasHeight;
		}
		minlen=(dw+dh)*0.05;	// 0.05はマジックナンバー
		mainloop();
	}


	/////////////////////////////////////////////////////////
	/////////　メインの処理
	/////////////////////////////////////////////////////////
    	
	function mainloop() {

	    switch (state) {
		case "init":
			initFunc();
			break;
        case "physics":
            physicsFunc();
            break;
	    }
	    setTimeout(mainloop, 100);
	}

	//////////////////////////////////////////////////////////
	//////  初期状態の処理
	//////////////////////////////////////////////////////
	function initFunc() {
		// 描画処理
		// 画面をリセット
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.fillStyle = 'white';
		context.fillRect(0, 0, canvasWidth, canvasHeight);

		// 全体の写真を描画
		context.drawImage(img, dx, dy, dw, dh);
	}

	
	//////////////////////////////////////////////////////////
	//////  変形計算の処理
	//////////////////////////////////////////////////////
	function physicsFunc() {
		// 描画処理
		// 画像処理
		var imgDt = context.getImageData(0,0,canvasWidth,canvasHeight);
		
		var w = imgDt.width;
		var h = imgDt.height;
		var r = [0,0,0];
		var g = [0,0,0];
		var b = [0,0,0];

		var imgDtBuf = numeric.linspace(0,0,w*h*4);

		for(var i=1; i<w-1; i++){
			for(var j=1; j<h-1; j++){

				r[0]=imgDt.data[((i-1)*w+j)*4+0];
				g[0]=imgDt.data[((i-1)*w+j)*4+1];
				b[0]=imgDt.data[((i-1)*w+j)*4+2];

				r[1]=imgDt.data[(i*w+j)*4+0];
				g[1]=imgDt.data[(i*w+j)*4+1];
				b[1]=imgDt.data[(i*w+j)*4+2];

				r[2]=imgDt.data[((i+1)*w+j)*4+0];
				g[2]=imgDt.data[((i+1)*w+j)*4+1];
				b[2]=imgDt.data[((i+1)*w+j)*4+2];

				/*
				if(j!=0) {
					r+=imgDt.data[(i*w+j-1)*4+0];
					g+=imgDt.data[(i*w+j-1)*4+1];
					b+=imgDt.data[(i*w+j-1)*4+2];
					cnt++;
				}
				if(j!=h-1) {
					r+=imgDt.data[(i*w+j+1)*4+0];
					g+=imgDt.data[(i*w+j+1)*4+1];
					b+=imgDt.data[(i*w+j+1)*4+2];
					cnt++;
				}
				*/

				var lambda=0.5;
				imgDtBuf[(i*w+j)*4+0]=r[1]+lambda*(r[0]-2*r[1]+r[2]);
				imgDtBuf[(i*w+j)*4+1]=g[1]+lambda*(g[0]-2*g[1]+g[2]);
				imgDtBuf[(i*w+j)*4+2]=b[1]+lambda*(b[0]-2*b[1]+b[2]);
			}
		}

		var n;
		for(var i=1; i<w-1; i++) {
			for(var j=1; j<h-1; j++) {
				for(var k=0; k<3; k++) {
					n=(i*w+j)*4+k;
					imgDt.data[n]=imgDtBuf[n];
				}
			}
		}

		context.putImageData(imgDt, 0, 0);
		console.log("hey");
	}
		
	//////////////////////////////////////////////////////////
	//////  イベント処理
	//////////////////////////////////////////////////////
		
	// リセットボタン
	$("#resetButton").click(function () {
		state="init";
	});

    // 流体計算ボタン
	$("#physicsButton").click(function () {
        state = "physics";
	});

	
} );

