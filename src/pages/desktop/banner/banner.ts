import { Component } from "@angular/core";
import { ImageResult, ResizeOptions } from 'ng2-imageupload';

import {HttpService} from "../../../providers/HttpService";
import {Utils} from "../../../providers/Utils";

declare var $: any;
declare var layer: any;
var paraPage: any;

@Component({
    selector   : 'page-banner',
    templateUrl: './banner.html',
    styleUrls: ['./banner.scss']
})
export class BannerPage {

    datas:any;
    subData:any={};
    src: string = "/assets/images/banner_df.jpg";
    imgUrl: string;
    resizeOptions: ResizeOptions = {
        resizeMaxHeight: 1024,
        resizeMaxWidth: 768,
        resizeQuality: 0.9
    };
    constructor(private httpService:HttpService,private utils:Utils) {
        this.httpService.items = null;
        this.httpService.currentPage = 1;
        this.loadData();
        paraPage = this;
        this.imgUrl = Utils.FILE_SERVE_URL+"/";
    }

    /**
    * 加载数据
    */
    loadData(){
        this.httpService.pagination({
            url:'/cms/banner/findAll',
            data:{}
        });
    }

    /**
    * 选择图片
    */
    selected(imageResult: ImageResult) {
        this.src = imageResult.resized
            && imageResult.resized.dataURL
            || imageResult.dataURL;
        this.subData.img = this.src;
    }

    /**
    * 弹出新增面板
    */
    showAddPanel(){
        this.subData = {
            bannerIdx: 1,
            title: '',
            description: '',
            img: '',
            state: '10'
        };
        this.src = "/assets/images/banner_df.jpg";
        layer.open({
            title: "添加广告图片",
            btn: ["保存","退出"],
            type: 1,
            closeBtn: 0,
            shade: 0,
            fixed: true,
            shadeClose: false,
            resize: false,
            area: ['400px','auto'],
            content: $("#editPanel"),
            yes: function(index:number){
                if(paraPage.validator()){
                    paraPage.httpService.post({
                        url:'/cms/banner/add',
                        data:paraPage.subData
                    }).subscribe((data:any)=>{
                        layer.closeAll();
                        if(data.code==='0000'){
                            //新增成功
                           layer.msg(data.message,{
                               icon: '1',
                               time: 2000
                           },function(){
                               paraPage.loadData();
                           });
                        }else if(data.code==='9999'){
                            Utils.show(data.message);
                        }else{
                            Utils.show("系统异常，请联系管理员");
                        }
                    });
                }
            }
        });
    }

    /**
    * 弹出编辑面板
    */
    showEditPanel(item:any){
        this.subData = Utils.copyObject(item);
        this.src = this.imgUrl+this.subData.img;
        layer.open({
            title: "修改广告图片",
            btn: ["保存","退出"],
            type: 1,
            closeBtn: 0,
            shade: 0,
            fixed: true,
            shadeClose: false,
            resize: false,
            area: ['400px','auto'],
            content: $("#editPanel"),
            yes: function(index:number){
                if(paraPage.validator()){
                    paraPage.httpService.post({
                        url:'/cms/banner/update',
                        data:paraPage.subData
                    }).subscribe((data:any)=>{
                        layer.closeAll();
                        if(data.code==='0000'){
                            //修改成功
                           layer.msg(data.message,{
                               icon: '1',
                               time: 2000
                           },function(){
                               paraPage.loadData();
                           });
                        }else if(data.code==='9999'){
                            Utils.show(data.message);
                        }else{
                            Utils.show("系统异常，请联系管理员");
                        }
                    });
                }
            }
        });
    }

    /**
    * 删除数据
    */
    deleteItem(item:any){
        layer.confirm('您确定要删除此数据吗？', {
            btn: ['确定','取消'] //按钮
        }, function(){
            paraPage.httpService.post({
                url:'/cms/banner/delete',
                data:item
            }).subscribe((data:any)=>{
                layer.closeAll();
                if(data.code==='0000'){
                    //删除成功
                   layer.msg(data.message,{
                       icon: '1',
                       time: 2000
                   },function(){
                       paraPage.loadData();
                   });
                }else if(data.code==='9999'){
                    Utils.show(data.message);
                }else{
                    Utils.show("系统异常，请联系管理员");
                }
            });
        });
    }

    /**
    * 显示图片
    */
    showImg(imgData:string){
        layer.open({
            type: 1,
            shade: false,
            title: false,
            area: ['auto','auto'],
            scrollbar: false,
            content: "<img src='"+imgData+"' style='padding:5px;'>",
            cancel: function(){
            }
        });
    }

    validator(){
        if(Utils.isEmpty(this.subData.title)){
            layer.tips('标题不能为空', '#title',{tips: 1});
            $("#title").focus();
            return false;
        }
        if(Utils.isEmpty(this.subData.img)){
            Utils.show('图片不能为空');
            return false;
        }
        if(Utils.isEmpty(this.subData.bannerIdx)){
            layer.tips('图片显示顺序不能为空', '#bannerIdx',{tips: 1});
            $("#bannerIdx").focus();
            return false;
        }
        if(!Utils.isNumber(this.subData.bannerIdx)){
            layer.tips('图片显示顺序只能是数字', '#bannerIdx',{tips: 1});
            $("#bannerIdx").focus();
            return false;
        }
        return true;
    }
}
