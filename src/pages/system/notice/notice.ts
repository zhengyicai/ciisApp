import { Component } from "@angular/core";
import { ImageResult, ResizeOptions } from 'ng2-imageupload';

import {HttpService} from "../../../providers/HttpService";
import {Utils} from "../../../providers/Utils";

declare var $: any;
declare var layer: any;
var paraPage: any;

@Component({
    selector   : 'page-notice',
    templateUrl: './notice.html',
    styleUrls: ['./notice.scss']
})
export class NoticePage {
    resizeOptions: ResizeOptions = {
        resizeMaxHeight: 768,
        resizeMaxWidth: 768,
        resizeQuality: 0.9
    };
    datas:any;
    subData:any={};
    src:string;
    communitys:any;//小区
    imgUrl: string;
    constructor(private httpService:HttpService,private utils:Utils) {
        this.httpService.items = null;
        this.httpService.currentPage = 1;
        this.loadData();
        paraPage = this;
        this.loadCommunitys();
        this.imgUrl = Utils.FILE_SERVE_URL+"/";
    }

    /**
    * 加载数据
    */
    loadData(){
        this.httpService.pagination({
            url:'/cms/notice/findAll',
            data:{}
        });
    }

    /**
    * 加载小区
    */
    loadCommunitys(){
        this.httpService.get({
            url:'/cms/resident/findCommunitys',
            data:{}
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.communitys = data.data;
            }else if(data.code==='9999'){
                Utils.show(data.message);
            }else{
                Utils.show("系统异常，请联系管理员");
            }
        });
    }

    /**
    * 弹出新增面板
    */
    showAddPanel(){
        let s= new Date();
        this.src = "/assets/images/uploadDefault.jpg";
        this.subData = {
            title: '',
            img: '',
            content: '',
            endTime: this.utils.dateFormat(new Date( s.getFullYear(), s.getMonth()+1, s.getDate()),'yyyy-MM-dd'),
            state: '10'
        };
        if(this.communitys != null && this.communitys.length>0){
            this.subData.communityId = this.communitys[0].id;
        }else{
            Utils.show("请先关联小区");
            return;
        }
        layer.open({
            title: "发布公告",
            btn: ["保存","退出"],
            type: 1,
            closeBtn: 0,
            shade: 0,
            fixed: true,
            shadeClose: false,
            resize: false,
            area: ['550px','510px'],
            content: $("#editPanel"),
            yes: function(index:number){
                if(paraPage.validator()){
                    paraPage.httpService.post({
                        url:'/cms/notice/add',
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
        this.src = !this.subData.img?"/assets/images/uploadDefault.jpg":this.imgUrl+this.subData.img;
        this.subData.endTime = this.utils.formatDate(item.endTime,'yyyy-MM-dd');
        layer.open({
            title: "修改公告",
            btn: ["保存","退出"],
            type: 1,
            closeBtn: 0,
            shade: 0,
            fixed: true,
            shadeClose: false,
            resize: false,
            area: ['550px','510px'],
            content: $("#editPanel"),
            yes: function(index:number){
                if(paraPage.validator()){
                    paraPage.httpService.post({
                        url:'/cms/notice/update',
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

    deleteItem(item:any){
        layer.confirm('您确定要删除此数据吗？', {
            btn: ['确定','取消'] //按钮
        }, function(){
            paraPage.httpService.post({
                url:'/cms/notice/delete',
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
    * 选择图片
    */
    selected(imageResult: ImageResult) {
        this.src = imageResult.resized
            && imageResult.resized.dataURL
            || imageResult.dataURL;
        this.subData.img = this.src;
    }

    uploadImg(){
        $("#uploadInput").click();
    }

    validator(){
        if(Utils.isEmpty(this.subData.title)){
            layer.tips('公告标题不能为空', '#title',{tips: 1});
            $("#title").focus();
            return false;
        }
        if(this.subData.title.length>50){
            layer.tips('标题不能超过50个字符', '#title',{tips: 1});
            $("#title").focus();
            return false;
        }
        if(Utils.isEmpty(this.subData.content)){
            layer.tips('公告内容不能为空', '#content',{tips: 1});
            $("#content").focus();
            return false;
        }
        if(this.subData.title.content>500){
            layer.tips('公告内容不能超过500个字符', '#content',{tips: 1});
            $("#content").focus();
            return false;
        }
        if(Utils.isEmpty(this.subData.endTime)){
            layer.tips('截止日期不能为空', '#endTime',{tips: 1});
            $("#endTime").focus();
            return false;
        }
        return true;
    }
}
