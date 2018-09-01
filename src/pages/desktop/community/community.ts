import { Component } from "@angular/core";

import {HttpService} from "../../../providers/HttpService";
import {Utils} from "../../../providers/Utils";

declare var $: any;
declare var layer: any;
var nowPage: any;

@Component({
    selector   : 'page-community',
    templateUrl: './community.html',
    styleUrls: ['./community.scss']
})
export class CommunityPage {

    datas:any;
    subData:any={};
    provinces:any;
    citys:any;
    areas:any;
    admins:any;
    isEdit:boolean;
    constructor(private httpService:HttpService,private utils:Utils) {
        this.httpService.items = null;
        this.httpService.currentPage = 1;
        this.loadData();
        this.loadProvince();
        nowPage = this;
    }

    /**
    * 加载数据
    */
    loadData(){
        this.httpService.pagination({
            url:'/cms/community/findAll',
            data:{}
        });
    }

    /**
    * 加载省份
    */
    loadProvince(){
        this.httpService.get({
            url:'/cms/community/findCitys',
            data:{
                parentCode:'100000'
            }
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.provinces = data.data;
                for(let opt in this.provinces){
                    if(!this.subData.provinceCode){
                        this.subData.provinceCode = this.provinces[opt].code;
                        this.subData.province = this.provinces[opt].name;
                        this.loadCity(this.subData.provinceCode);
                    }
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
    * 加载城市
    */
    loadCity(provinceCode:string){
        this.httpService.get({
            url:'/cms/community/findCitys',
            data:{
                parentCode:provinceCode
            }
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.citys = data.data;
                for(let opt in this.citys){
                    if(!this.subData.cityCode){
                        this.subData.cityCode = this.citys[opt].code;
                        this.subData.city = this.citys[opt].name;
                        this.loadArea(this.subData.cityCode);
                    }
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
    * 加载区县
    */
    loadArea(cityCode:string){
        this.httpService.get({
            url:'/cms/community/findCitys',
            data:{
                parentCode:cityCode
            }
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.areas = data.data;
                for(let opt in this.areas){
                    if(!this.subData.areaCode){
                        this.subData.areaCode = this.areas[opt].code;
                        this.subData.area = this.areas[opt].name;
                    }
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
    * 弹出新增面板
    */
    showAddPanel(){
        this.isEdit = false;
        this.subData={
            communityName:'',
            ddress:'',
            state:'10'
        };
        this.loadProvince();
        layer.open({
            title: "添加小区",
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
                        url:'/cms/community/add',
                        data:nowPage.subData
                    }).subscribe((data:any)=>{
                        layer.closeAll();
                        if(data.code==='0000'){
                            //新增成功
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
                }
            }
        });
    }

    /**
    * 弹出编辑面板
    */
    showEditPanel(item:any){
        this.isEdit = true;
        this.subData = Utils.copyObject(item);
        this.loadCity(item.provinceCode);
        this.loadArea(item.cityCode);
        layer.open({
            title: "编辑小区",
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
                        url:'/cms/community/update',
                        data:nowPage.subData
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
                }
            }
        });
    }

    /**
    * 管理员
    */
    showAdmin(item:any){
        this.httpService.get({
            url:'/cms/community/findAdmin',
            data:{
                communityId:item.id
            }
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.admins = data.data;
                layer.open({
                    title: "关联管理员",
                    btn: ["保存","退出"],
                    type: 1,
                    closeBtn: 0,
                    shade: 0,
                    fixed: true,
                    shadeClose: false,
                    resize: false,
                    area: ['380px','auto'],
                    content: $("#adminPanel"),
                    yes: function(index:number){
                        let userIds = new Array();
                        console.log("======"+JSON.stringify(nowPage.admins));
                        for(let obj in nowPage.admins){
                            if(nowPage.admins[obj].checked){
                                userIds.push(nowPage.admins[obj].userId);
                            }
                        }
                        nowPage.httpService.post({
                            url:'/cms/community/saveAdmin',
                            data:{
                                communityId:item.id,
                                userIds:userIds
                            }
                        }).subscribe((data:any)=>{
                            layer.closeAll();
                            if(data.code==='0000'){
                                //保存成功
                                layer.msg(data.message,{
                                    icon: '1',
                                    time: 2000
                                },function(){});
                            }else if(data.code==='9999'){
                                Utils.show(data.message);
                            }else{
                                Utils.show("系统异常，请联系管理员");
                            }
                        });
                    }
                });
            }else if(data.code==='9999'){
                Utils.show(data.message);
            }else{
                Utils.show("系统异常，请联系管理员");
            }
        });
    }

    /**
    * 改变省份
    */
    selectProvince(obj:any){
        this.subData.province = this.provinces[obj.selectedIndex].name;
        this.subData.cityCode=null;
        this.subData.areaCode=null;
        this.loadCity(obj.value);
    }

    /**
    * 改变城市
    */
    selectCity(obj:any){
        this.subData.city = this.citys[obj.selectedIndex].name;
        this.subData.areaCode=null;
        this.loadArea(obj.value);
    }

    /**
    * 改变区县
    */
    selectArea(obj:any){
        this.subData.area = this.areas[obj.selectedIndex].name;
    }


    validator(){
        if(Utils.isEmpty(this.subData.communityName)){
            layer.tips('小区名不能为空', '#communityName',{tips: 1});
            $("#communityName").focus();
            return false;
        }
        if(Utils.isEmpty(this.subData.buildingNum)){
            layer.tips('楼栋数不能为空', '#buildingNum',{tips: 1});
            $("#buildingNum").focus();
            return false;
        }
        if(isNaN(this.subData.buildingNum)){
            layer.tips('楼栋数输入有误', '#buildingNum',{tips: 1});
            $("#buildingNum").select();
            return false;
        }
        if(this.subData.buildingNum<1 || this.subData.buildingNum>99){
            layer.tips('楼栋数只能输入1～99', '#buildingNum',{tips: 1});
            $("#buildingNum").select();
            return false;
        }
        if(Utils.isEmpty(this.subData.address)){
            layer.tips('地址不能为空', '#address',{tips: 1});
            $("#address").focus();
            return false;
        }
        return true;
    }
}
