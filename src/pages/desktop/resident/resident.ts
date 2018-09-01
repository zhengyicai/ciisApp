import { Component } from "@angular/core";

import {HttpService} from "../../../providers/HttpService";
import {Utils} from "../../../providers/Utils";

declare var $: any;
declare var layer: any;
var nowPage: any;

@Component({
    selector   : 'page-resident',
    templateUrl: './resident.html',
    styleUrls: ['./resident.scss']
})
export class ResidentPage {

    datas:any;//显示表格数据
    subData:any={};//提交表单数据
    criteria:string='';//查询条件
    communitys:any;//小区
    residentId:string;//住户编号
    communityId:string;//小区编号
    buildingId:string;//楼栋编号
    unitNo:string;//单元编号
    roomId:string;//房间编号
    buildings:any;//楼栋集合
    units:any;//单元集合
    rooms:any;//房间集合
    residRooms:any;//住户房间集合
    owner:string;//户主
    constructor(private httpService:HttpService,private utils:Utils) {
        this.httpService.items = null;
        this.httpService.currentPage = 1;
        this.loadData();
        this.loadCommunitys();
        nowPage = this;
    }

    /**
    * 加载数据
    */
    loadData(){
        this.httpService.pagination({
            url:'/cms/resident/findAll',
            data:{
                criteria:this.criteria
            }
        });
    }

    /**
    * 查询
    */
    query(){
        this.loadData();
    }

    /**
    * 回车查询
    */
    queryData(evt:any){
        if(evt.keyCode===13){
            this.loadData();
        }
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

    deleteItem(item:any){
        layer.confirm('您确定要删除此数据吗？', {
            btn: ['确定','取消'] //按钮
        }, function(){
            nowPage.httpService.post({
                url:'/cms/resident/delete',
                data:item
            }).subscribe((data:any)=>{
                layer.closeAll();
                if(data.code==='0000'){
                    //删除成功
                   layer.msg(data.message,{
                       icon: '1',
                       time: 2000
                   },function(){
                       nowPage.loadData();
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
    * 修改状态
    */
    updateState(item:any,state:string){
        layer.confirm('您确定要执行此操作吗？', {
            btn: ['确定','取消'] //按钮
        }, function(){
            nowPage.httpService.post({
                url:'/cms/resident/updateState',
                data:{
                    communityId:item.communityId,
                    id:item.id,
                    state:state
                }
            }).subscribe((data:any)=>{
                layer.closeAll();
                if(data.code==='0000'){
                    //修改成功
                   layer.msg(data.message,{
                       icon: '1',
                       time: 2000
                   },function(){
                       nowPage.loadData();
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
    * 弹出新增面板
    */
    showAddPanel(){
        this.subData = {
            mobile: '',
            state: '10'
        };
        for(let o in this.communitys){
            this.subData.communityId = this.communitys[o].id;
            break;
        }
        if(this.subData.communityId==''){
            Utils.show("请联系管理员关联小区");
            return;
        }
        layer.open({
            title: "添加住户信息",
            btn: ["保存","退出"],
            type: 1,
            closeBtn: 0,
            shade: 0,
            fixed: true,
            shadeClose: false,
            resize: false,
            area: ['350px','auto'],
            content: $("#editPanel"),
            yes: function(index:number){
                if(nowPage.validator()){
                    nowPage.httpService.post({
                        url:'/cms/resident/add',
                        data:nowPage.subData
                    }).subscribe((data:any)=>{
                        layer.closeAll();
                        if(data.code==='0000'){
                            //新增成功
                           layer.msg(data.message,{
                               icon: '1',
                               time: 2000
                           },function(){
                               nowPage.criteria = '';
                               nowPage.loadData();
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
    * 弹出关联房号
    */
    showRelationPanel(item:any){
        this.communityId = item.communityId;
        this.residentId = item.id;
        this.buildings = null;
        this.buildingId = null;
        this.units = null;
        this.unitNo = null;
        this.rooms = null;
        this.roomId = null;
        this.residRooms = null;
        this.owner = '20';
        this.loadBuildings();
        this.loadResidentRooms();
        layer.open({
            title: "用户住房信息",
            type: 1,
            closeBtn: 1,
            shade: 0,
            fixed: true,
            shadeClose: false,
            resize: false,
            area: ['420px','300px'],
            content: $("#relationPanel")
        });
    }

    /*
    * 保存用户房间关系
    */
    addRelation(){
        this.httpService.post({
            url:'/cms/resident/addRelation',
            data:{
                residentId: this.residentId,
                roomId: this.roomId,
                communityId: this.communityId,
                owner: this.owner
            }
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                //保存成功
               layer.msg(data.message,{
                   icon: '1',
                   time: 2000
               },function(){
                   nowPage.loadResidentRooms();
               });
            }else if(data.code==='9999'){
                Utils.show(data.message);
            }else{
                Utils.show("系统异常，请联系管理员");
            }
        });
    }

    /**
    * 选择楼栋
    */
    selectBuild(selectIdx:number){
        this.buildingId = this.buildings[selectIdx].value;
        this.loadUnits();
    }

    /**
    * 选择单元
    */
    selectUnit(selectIdx:number){
        this.unitNo = this.units[selectIdx].value;
        this.loadRooms();
    }

    /**
    * 选择房间
    */
    selectRoom(selectIdx:number){
        this.roomId = this.rooms[selectIdx].value;
    }

    /**
    * 加载楼栋
    */
    loadBuildings(){
        this.httpService.get({
            url:'/cms/resident/findBuildings',
            data:{
                communityId:this.communityId
            }
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.buildings = data.data;
                for(let obj in this.buildings){
                    this.selectBuild(0);
                    break;
                }
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
                buildingId:this.buildingId
            }
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.units = data.data;
                for(let obj in this.units){
                    this.selectUnit(0);
                    break;
                }
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
                buildingId:this.buildingId,
                unitNo:this.unitNo
            }
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.rooms = data.data;
                for(let obj in this.rooms){
                    this.selectRoom(0);
                    break;
                }
            }else if(data.code==='9999'){
                Utils.show(data.message);
            }else{
                Utils.show("系统异常，请联系管理员");
            }
        });
    }

    /**
    * 加载住户房间信息
    */
    loadResidentRooms(){
        this.httpService.get({
            url:'/cms/resident/findResidentRooms',
            data:{
                residentId: this.residentId,
                communityId: this.communityId
            }
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.residRooms = data.data;
            }else if(data.code==='9999'){
                Utils.show(data.message);
            }else{
                Utils.show("系统异常，请联系管理员");
            }
        });
    }

    /**
    * 删除关系
    */
    deleteRMItem(roomId:string){
        layer.confirm('您确定要删除此数据吗？', {
            btn: ['确定','取消'] //按钮
        }, function(){
            nowPage.httpService.post({
                url:'/cms/resident/delRelation',
                data:{
                    residentId:nowPage.residentId,
                    roomId:roomId
                }
            }).subscribe((data:any)=>{
                if(data.code==='0000'){
                    //删除成功
                   layer.msg(data.message,{
                       icon: '1',
                       time: 2000
                   },function(){
                       nowPage.loadResidentRooms();
                   });
                }else if(data.code==='9999'){
                    Utils.show(data.message);
                }else{
                    Utils.show("系统异常，请联系管理员");
                }
            });
        });
    }

    validator(){
        if(Utils.isEmpty(this.subData.mobile)){
            layer.tips('手机号不能为空', '#mobile',{tips: 1});
            $("#mobile").focus();
            return false;
        }
        if(!Utils.isMobile(this.subData.mobile)){
            layer.tips('手机号不符合规则', '#mobile',{tips: 1});
            $("#mobile").select();
            return false;
        }
        return true;
    }
}
