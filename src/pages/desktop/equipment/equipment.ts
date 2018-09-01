import { Component } from "@angular/core";

import {HttpService} from "../../../providers/HttpService";
import {Utils} from "../../../providers/Utils";

declare var $: any;
declare var layer: any;
var paraPage: any;

@Component({
    selector   : 'page-equipment',
    templateUrl: './equipment.html',
    styleUrls: ['./equipment.scss']
})
export class EquipmentPage {

    datas:any;//显示表格数据
    subData:any={};//提交表单数据
    criteria:string='';//查询条件
    communitys:any;//小区
    residentId:string;//住户编号
    communityId:string;//小区编号
    buildingId:string;//楼栋编号
    unitNo:string;//单元编号
    buildings:any;//楼栋集合
    units:any;//单元集合
    isEdit:boolean = true;
    constructor(private httpService:HttpService,private utils:Utils) {
        this.httpService.items = null;
        this.httpService.currentPage = 1;
        this.loadData();
        this.loadCommunitys();
        paraPage = this;
    }

    /**
    * 加载数据
    */
    loadData(){
        this.httpService.pagination({
            url:'/cms/equipment/findAll',
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

    deleteItem(item:any){
        layer.confirm('您确定要删除此数据吗？', {
            btn: ['确定','取消'] //按钮
        }, function(){
            paraPage.httpService.post({
                url:'/cms/equipment/delete',
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
    * 弹出新增面板
    */
    showAddPanel(){
        this.loadCommunitys();
        this.isEdit = true;
        this.subData = {
            equipmentName: '',
            equipmentType: '10',
            state: '10',
            communityId:this.communityId,
            buildingId:this.buildingId,
            unitName:this.unitNo
        };
        if(Utils.isEmpty(this.communityId)){
            Utils.show("请先设置小区");
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
                if(paraPage.validator()){
                    paraPage.httpService.post({
                        url:'/cms/equipment/add',
                        data:paraPage.subData
                    }).subscribe((data:any)=>{
                        layer.closeAll();
                        if(data.code==='0000'){
                            //新增成功
                           layer.msg(data.message,{
                               icon: '1',
                               time: 2000
                           },function(){
                               paraPage.criteria = '';
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
    * 选择设备类型
    */
    selectEquType(){
        if(this.subData.equipmentType === '30'){
            this.isEdit = false;
        }else{
            this.isEdit = true;
        }
    }

    /**
    * 选择小区
    */
    selectCommunity(selectIdx:number){
        this.communityId = this.communitys[selectIdx].value;
        this.subData.communityId = this.communityId;
        this.buildingId = '';
        this.unitNo = '';
        this.loadBuildings();
    }

    /**
    * 选择楼栋
    */
    selectBuild(selectIdx:number){
        this.buildingId = this.buildings[selectIdx].value;
        this.subData.buildingId = this.buildingId;
        this.unitNo = '';
        this.loadUnits();
    }

    /**
    * 选择单元
    */
    selectUnit(selectIdx:number){
        this.unitNo = this.units[selectIdx].value;
        this.subData.unitName = this.unitNo;
    }

    /**
    * 加载小区
    */
    loadCommunitys(){
        this.httpService.get({
            url:'/cms/equipment/findCommunitys',
            data:{}
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.communitys = data.data;
                for(let obj in this.communitys){
                    this.selectCommunity(0);
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
    * 加载楼栋
    */
    loadBuildings(){
        this.httpService.get({
            url:'/cms/equipment/findBuildings',
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
            url:'/cms/equipment/findUnits',
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

    validator(){
        if(Utils.isEmpty(this.subData.equipmentName)){
            layer.tips('设备名称不能为空', '#equipmentName',{tips: 1});
            $("#equipmentName").focus();
            return false;
        }
        if(this.subData.equipmentType==='30'){
            if(Utils.isEmpty(this.buildingId)){
                Utils.show("请先创建当前小区的楼栋");
                return false;
            }
            if(Utils.isEmpty(this.unitNo)){
                Utils.show("请先创建当前楼栋的单元");
                return false;
            }
        }
        return true;
    }
}
