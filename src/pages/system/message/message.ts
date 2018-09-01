import { Component } from "@angular/core";
import { ImageResult, ResizeOptions } from 'ng2-imageupload';

import {HttpService} from "../../../providers/HttpService";
import {Utils} from "../../../providers/Utils";

declare var $: any;
declare var layer: any;
var paraPage: any;

@Component({
    selector   : 'page-message',
    templateUrl: './message.html',
    styleUrls: ['./message.scss']
})
export class MessagePage {
    resizeOptions: ResizeOptions = {
        resizeMaxHeight: 768,
        resizeMaxWidth: 768,
        resizeQuality: 0.9
    };
    imgUrl: string;
    datas:any;
    subData:any={};
    communitys:any;//小区
    communityName:string='';//小区名称
    buildings:any;//楼栋集合
    buildingName:string='';//楼栋名称
    units:any;//单元集合
    unitName:string='';//单元名称
    rooms:any;//房间集合
    roomName:string='';//房间名称
    src:string;
    constructor(private httpService:HttpService,private utils:Utils) {
        this.httpService.items = null;
        this.httpService.currentPage = 1;
        this.loadData();
        this.loadCommunitys();
        paraPage = this;
        this.imgUrl = Utils.FILE_SERVE_URL+"/";
    }

    /**
    * 加载数据
    */
    loadData(){
        this.httpService.pagination({
            url:'/cms/message/findAll',
            data:{}
        });
    }

    /**
    * 弹出新增面板
    */
    showAddPanel(){
        this.subData = {
            title: '',
            content: '',
            buildingId: '',
            unitId: '',
            roomId: ''
        };
        this.src = "/assets/images/uploadDefault.jpg";
        this.communityName = '';
        this.buildingName = '';
        this.unitName = '';
        this.roomName = '';
        if(this.communitys == null || this.communitys.length==0){
            Utils.show("请联系管理员添加小区");
        }else{
            this.subData.communityId = this.communitys[0].id;
            this.communityName = this.communitys[0].value;
            this.loadBuildings();
        }
        layer.open({
            title: "添加参数",
            btn: ["保存","退出"],
            type: 1,
            closeBtn: 0,
            shade: 0,
            fixed: true,
            shadeClose: false,
            resize: false,
            area: ['550px','410px'],
            content: $("#editPanel"),
            yes: function(index:number){
                if(paraPage.validator()){
                    paraPage.subData.sendee = "["+paraPage.communityName+"]"+paraPage.buildingName+paraPage.unitName+paraPage.roomName;
                    paraPage.httpService.post({
                        url:'/cms/message/add',
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

    deleteItem(item:any){
        layer.confirm('您确定要删除此数据吗？', {
            btn: ['确定','取消'] //按钮
        }, function(){
            paraPage.httpService.post({
                url:'/cms/message/delete',
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
    * 加载楼栋
    */
    loadBuildings(){
        this.httpService.get({
            url:'/cms/resident/findBuildings',
            data:{
                communityId:this.subData.communityId
            }
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.buildings = data.data;
            }else if(data.code==='9999'){
                Utils.show(data.message);
            }else{
                Utils.show("系统异常，请联系管理员");
            }
        });
    }

    /**
    * 加载单元
    */
    loadUnits(){
        this.httpService.get({
            url:'/cms/resident/findUnits',
            data:{
                buildingId:this.subData.buildingId
            }
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.units = data.data;
            }else if(data.code==='9999'){
                Utils.show(data.message);
            }else{
                Utils.show("系统异常，请联系管理员");
            }
        });
    }

    /**
    * 加载房间
    */
    loadRooms(){
        this.httpService.get({
            url:'/cms/resident/findRooms',
            data:{
                buildingId:this.subData.buildingId,
                unitNo:this.subData.unitId
            }
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.rooms = data.data;
            }else if(data.code==='9999'){
                Utils.show(data.message);
            }else{
                Utils.show("系统异常，请联系管理员");
            }
        });
    }

    /**
    * 选择小区
    */
    selectCommunity(idx:number){
        this.communityName = this.communitys[idx].value;
        this.loadBuildings();
        this.buildingName = '';
        this.subData.buildingId = '';
        this.unitName = '';
        this.subData.unitId = '';
        this.roomName = '';
        this.subData.roomId = '';
    }

    /**
    * 选择楼栋
    */
    selectBuild(idx:number){
        this.unitName = '';
        this.subData.unitId = '';
        this.roomName = '';
        this.subData.roomId = '';
        if(idx==0){
            this.buildingName='';
        }else{
            this.buildingName = this.buildings[idx-1].name;
            this.loadUnits();
        }
    }

    /**
    * 选择单元
    */
    selectUnit(idx:number){
        this.roomName = '';
        this.subData.roomId = '';
        if(idx==0){
            this.unitName = '';
        }else{
            this.unitName = this.units[idx-1].name;
            this.loadRooms();
        }
    }

    /**
    * 选择房间
    */
    selectRoom(idx:number){
        if(idx==0){
            this.roomName = '';
        }else{
            this.roomName = this.rooms[idx-1].name;
            this.loadRooms();
        }
    }

    validator(){
        if(Utils.isEmpty(this.subData.title)){
            layer.tips('标题不能为空', '#title',{tips: 1});
            $("#title").focus();
            return false;
        }
        if(Utils.isEmpty(this.subData.content)){
            layer.tips('内容不能为空', '#content',{tips: 1});
            $("#content").focus();
            return false;
        }
        return true;
    }
}
