<template lang="jade">
	div.wuji-container.center-block
		div.wuji-header
			el-row(:gutter="20")
				el-col.wuji-category(:span="8")
					el-select.category-select(v-model="categoryId", placeholder="请选择分类")
						el-option(v-for="item in categoryList", :label="item.name", :value="item.categoryId")
							span.category-name {{ item.name }}
							span.category-color(:style="{backgroundColor: '#' + (item.colorHex ? item.colorHex : 'transparent')}")
				el-col(:span="8")
					div.label 颜色
					el-select.font-select(v-model="fontcolor", placeholder="请选择字体颜色")
						el-option(v-for="item in colorList", :label="item", :value="item.substr(1)")
							span.font-name {{ item }}
							span.font-color(:style="{backgroundColor: item}")
				el-col(:span="8")
					div.label 字体
					el-slider(v-model="fontsize", :min="10", :max="40", format-tooltip="formatTooltip")
			el-row(:gutter="20")
				el-col(:span="5")
					div.label 是否同步过客
					el-switch(v-model="isPassby", on-text="", off-text="")
				el-col(:span="7")
					div.label 当前所在位置：
					div.location(:title="location") {{location}}
				el-col(:span="6")
					el-select.category-select(v-model="weather", placeholder="天气好吗")
						el-option(v-for="item in weatherList", :label="item.name", :value="item.value")
							span.weather-name {{ item.name }}
							span.weather-icon
								img(:src="item.url")
				el-col(:span="6")
					el-date-picker(v-model="createDate", type="datetime", placeholder="选择创建日期", align="right", :picker-options="pickerOptions")
		textarea.wuji-content( :style="styleObject",v-model="content")  {{content}}
		div.label 引用链接：
				input(v-model="url")
		el-upload.wuji-upload(name="MediaChildren", :drag="true", action="https://jsonplaceholder.typicode.com/posts/", :multiple="true", :list-type="listType", accept=".jpg,.png,.gif,.mp4", :file-list="fileList", :on-success="fileUploadSuccess", :on-error="fileUploadError", :on-progress="fileUploadProgress")
			i.el-icon-upload
			div.el-upload__text 将文件拖到此处，或<em>点击上传</em>
			div.el-upload__tip(slot="tip")
				span 默认只能上传jpg/png文件，且不超过500kb，是否上传小视频(暂时没用)&nbsp;
				el-switch(v-model="isUploadVideo", on-text="是", off-text="否", :width="50")
		a.wuji-submit(href="javascript:void(0);", @click="doSave" v-text="isCreate ? '记录' : '修改'")
</template>
<script>
    import Vue from 'vue'
    import Api from "utils/api"
    import {fontColor} from 'config/color'
    import weather from 'config/weather'
    import {Row, Col, Select, Option, Slider, Switch, Message, DatePicker, Upload} from "element-ui"
	// 引入组件
	Vue.use(Row)
	Vue.use(Col)
	Vue.use(Select)
	Vue.use(Option)
	Vue.use(Slider)
	Vue.use(Switch)
	Vue.use(DatePicker)
	Vue.use(Upload)
    export default{
        name: 'diarydedit',
        data(){
        	return{
        		isCreate: true,
        		categoryList: [],
        		colorList: fontColor,
        		weatherList: weather,
        		categoryId: 0,
        		fontsize: 14,
        		fontcolor: '000000',
        		isPassby: false,
        		weather: 0,
        		createDate: new Date(),
        		location: '',
        		content: '',
				url:'',
		        pickerOptions: {
		          shortcuts: [{
		            text: '今天',
		            onClick(picker) {
		              picker.$emit('pick', new Date());
		            }
		          }, {
		            text: '昨天',
		            onClick(picker) {
		              const date = new Date();
		              date.setTime(date.getTime() - 3600 * 1000 * 24);
		              picker.$emit('pick', date);
		            }
		          }, {
		            text: '一周前',
		            onClick(picker) {
		              const date = new Date();
		              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
		              picker.$emit('pick', date);
		            }
		          }]
		        },
		        isUploadVideo: false,
		        fileList: []
        	}
        },
        created(){
        	this.getCategoryList();
        	this.init();
        },
        mounted(){
        	if(this.isCreate){
        		this.getLocation();
        	}
        },
        computed:{
        	styleObject(){
        		return {
        			fontSize: this.fontsize + 'px',
        			color: '#' + this.fontcolor
        		}
        	},
        	listType(){
        		return this.isUploadVideo ? 'text' : 'picture';
        	}
        },
        methods:{
        	//文件上传
        	fileUploadSuccess(response, file, fileList){
        		console.log("上传成功start");
        		console.log(response);
        		console.log(file);
        		console.log(fileList);
        		console.log("上传成功end");
        		//从这里获得每次上传的文件，以及文件列表有哪些上传图片信息
        	},
        	fileUploadError(err, file, fileList){
        		console.log("上传失败start");
        		console.log(err);
        		console.log(file);
        		console.log(fileList);
        		console.log("上传失败end");
        	},
        	fileUploadProgress(event, file, fileList){
        		console.log("上传过程start");
        		console.log(event);
        		console.log(file);
        		console.log(fileList);
        		console.log("上传过程end");
        	},
        	init(){
        		if(this.$route.query.id){
        			this.isCreate = false;
        		}else{
        			return;
        		}
        		this.getEditDiary(this.$route.query.id);
        	},
        	getEditDiary(token){
	            let _self = this, params = { keyValue: token };
	            //params => 参数
	            Api.getEditDiary(params).then(result => {
	            	console.log(result);
	                _self.initData(result);
	            }).catch(error => {
	                Message({message: error, type: 'error', showClose: true});
	            });
        	},
        	initData(data){
        		this.content = data.content;
        		this.categoryId = data.categoryId;
        		this.fontsize = data.fontsize;
        		this.fontcolor = data.fontcolor;
        		this.weather = data.weather;
        		this.isPassby = data.isPassby === 0 ? false : true;
        		this.location = data.address;
        		let date = data.createDate;
        		this.createDate = new Date(date.substr(0,4), date.substr(4,2), date.substr(6,2), date.substr(8,2), date.substr(10,2), date.substr(12,2));
        		this.fileList = this.transformImages(data.MediaChildren);
        	},
        	transformImages(mediaChildren){
        		//暂时不支持视频文件
        		if(mediaChildren.length === 0){
        			return [];
        		}
        		let arr = [];
        		mediaChildren.forEach((item) => {
        			if (item.mediaType === 1) {
        				arr.push({
        					name: item.url,
        					url: item.Qnurl
        				});
        			}
        		});
        		return arr;
        	},
        	doSave(){

        		//保存操作，需要对上传图片进行组装
//        		alert('保存')
				console.log("run in" , this.content);
				if(this.isCreate){
					this.$route.query.id = this.$route.query.id-1|| 6981792;
				}
				var paraObj = {
					id: this.$route.query.id,
					content: this.content,
					createDate: this.createDate,
					weekday: 2,
					weather: this.weather,
					address: this.location,
					categoryId: this.categoryId,
					isPassby: this.isPassby,
					categoryName: "前端",
					colorHex: this.fontcolor,
					MediaChildren: this.fileList,
					title: this.content,
					fontType: this.fontsize,
					url:this.url
				}

				let _self = this, params = paraObj;
				Api.saveDiary(params).then(result => {
					_self.diary = result;

				    this.$router.push({ path: 'index', query: { id:this.$route.query.id }});

			    }).catch(error => {
					Message({message: error, type: 'error', showClose: true});
			    });
        	},
        	getLocation(){
        		//动态创建script，实现跨域
        		const head = document.getElementsByTagName('head')[0];
        		let script = document.createElement('script'), _self = this;
        		script.type = 'text/javascript';
        		script.src = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js';
        		head.appendChild(script);
				script.onload = script.onreadystatechange = function() {
				    if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
				        if(remote_ip_info.ret == 1){
				        	_self.location = remote_ip_info.province + remote_ip_info.city + remote_ip_info.district;
				        }else{
				        	_self.location = '获取不到定位';
				        }
				        script.onload = script.onreadystatechange = null;
				        head.removeChild(script);
				    }
				};
        	},
	        getCategoryList(){
	            let _self = this, params;
	            //params => 参数
	            Api.getCategoryList(params).then(result => {
	                _self.categoryList = result;
	            }).catch(error => {
	                Message({message: error, type: 'error', showClose: true});
	            });
	        },
	        formatTooltip(font){
	        	return font + 'px';
	        }
        },
        components: {}
    }
</script>
<style lang="sass">
	@import "../../public/scss/index.scss";
	$prefix: 'wuji';
	.#{$prefix}-container{
	    width: $container-width;
	    .#{$prefix}-header{
			padding: 20px 0 10px 0;
			.el-row{
				margin-bottom: 10px;
			}
			.label, .location{
				float: left;
				margin-top: 7px;
				margin-right: 5px;
			}
			.location{
				width: 140px;
				display: inline-block;
				@extend %ellipsis;
			}
			.category-select{
				display: block;
			}
			.font-select{
				margin-left: 5px;
				width: 248px;
			}
			.el-slider{
				padding-left: 45px;
			}
			.el-switch__core{
				top: 4px;
			}
			.el-date-editor.el-input{
				width: 210px;
			}
	    }
		.#{$prefix}-content{
			overflow: auto;
			padding: 10px;
			outline: none;
			background-color: $white;
			border: 1px $white solid;
			height: 500px;
			width: 100%;
			border-radius: 4px;
			&:focus{
				border: 1px $main solid;
			}
		}
		.#{$prefix}-upload{
			margin: 20px 0;
		}
		.#{$prefix}-submit{
			height: 40px;
			line-height: 40px;
			text-align: center;
			display: block;
			color: $white;
			background-color: $main;
			font-size: $size-h3;
			border-radius: 4px;
			margin-bottom: 20px;
		}
	}
	.el-scrollbar{
		.category-name,
		.weather-name,
		.font-name{
			float: left;
		}
		.category-color,
		.font-color{
			float: right;
			display: inline-block;
			margin-top: 4px;
			width: 14px;
			height: 14px;
			border-radius: 50%;
		}
		.weather-icon{
			float: right;
			img{
				width: 20px;
				height: auto;
			}
		}
	}
	//reset
	.el-upload-dragger{
		width: 900px;
	}
	.el-select-dropdown__item.selected.hover{
		background-color: $main;
	}
	.el-slider__button:hover, .el-slider__button.hover, .el-slider__button.dragging {
	    transform: scale(1.5);
	    background-color: $main;
	}
</style>