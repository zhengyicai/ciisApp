import { Component } from "@angular/core";

import {HttpService} from "../../../providers/HttpService";
import {Utils} from "../../../providers/Utils";

declare var $: any;
declare var layer: any;
var paraPage: any;

@Component({
    selector   : 'page-newResident',
    templateUrl: './newResident.html',
    styleUrls: ['./newResident.scss']
})
export class NewResidentPage {

    datas:any;//显示表格数据
    subData:any={};//提交表单数据
    criteria:string='';//查询条件
    isEdit:boolean;
    constructor(private httpService:HttpService,private utils:Utils) {
        this.httpService.items = null;
        this.httpService.currentPage = 1;
        this.loadData();
        paraPage = this;
    }

    /**
    * 加载数据
    */
    loadData(){
        this.httpService.pagination({
            url:'/cms/newResident/findAll',
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
    * 删除
    */
    deleteItem(item:any){
        layer.confirm('您确定要删除此数据吗？', {
            btn: ['确定','取消'] //按钮
        }, function(){
            paraPage.httpService.post({
                url:'/cms/newResident/delete',
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
        this.isEdit = false;
        this.subData = {
            name: '',
            mobile: '',
            password: ''
        };
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
                        url:'/cms/newResident/add',
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
    * 弹出编辑面板
    */
    showEditPanel(item:any){
        this.isEdit = true;
        this.subData = Utils.copyObject(item);
        this.subData.password = '******';
        layer.open({
            title: "修改住户信息",
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
                        url:'/cms/newResident/update',
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


    validator(){
        if(Utils.isEmpty(this.subData.name)){
            layer.tips('姓名不能为空', '#name',{tips: 1});
            $("#name").focus();
            return false;
        }
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
        if(Utils.isEmpty(this.subData.password)){
            layer.tips('密码不能为空', '#password',{tips: 1});
            $("#password").focus();
            return false;
        }
        return true;
    }
}
