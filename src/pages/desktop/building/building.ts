import { Component } from "@angular/core";

import {HttpService} from "../../../providers/HttpService";
import {Utils} from "../../../providers/Utils";
import { TreeModule } from 'ng2-tree';

declare var $: any;
declare var layer: any;
var nowPage: any;

@Component({
    selector   : 'page-building',
    templateUrl: './building.html',
    styleUrls: ['./building.scss']
})
export class BuildingPage {

    datas:any;
    subData:any={};
    tree:any;
    communityId:string;
    constructor(private httpService:HttpService,private utils:Utils) {
        this.httpService.items = null;
        this.httpService.currentPage = 1;
        this.loadTreeData();
        nowPage = this;
    }

    /**
    * 加载小区树型数据
    */
    loadTreeData(){
        this.httpService.get({
            url:'/cms/building/findTree',
            data:{}
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.tree = {
                    settings: {
                        static: true,
                        rightMenu: false,
                        leftMenu: false,
                        cssClasses: {
                            expanded: 'fa fa-caret-down fa-lg',
                            collapsed: 'fa fa-caret-right fa-lg',
                            empty: 'fa fa-caret-right disabled',
                            leaf: 'fa'
                        },
                        templates: {
                            node: '<i class="fa fa-folder-o fa-lg"></i>',
                            leaf: '<i class="fa fa-file-o" fa-lg></i>'
                        }
                    },
                    value: '小区',
                    id: 'root',
                    children: data.data
              };
              for(let obj in data.data){
                  this.communityId = data.data[obj].id;
                  this.loadCommunityData();
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
    * 选中节点
    */
    onNodeSelected(event:any){
        if(!event.node.children){
            this.httpService.currentPage = 1;
            this.communityId = event.node.node.id;
            this.loadCommunityData();
        }
    }

    /**
    * 更新状态
    */
    updateState(id:string,state:string){
        layer.confirm('您确定要执行此操作吗？', {
            btn: ['确定','取消'] //按钮
        }, function(){
            nowPage.httpService.post({
                url:'/cms/building/updateState',
                data:{
                    id:id,
                    state:state
                }
            }).subscribe((data:any)=>{
                layer.closeAll();
                if(data.code==='0000'){
                    //删除成功
                   layer.msg(data.message,{
                       icon: '1',
                       time: 2000
                   },function(){
                       nowPage.loadCommunityData();
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
    * 生成房间
    */
    createRoom(item:any){
        this.subData = Utils.copyObject(item);
        this.subData.unitNumber = 1;
        this.subData.floorNumber = 1;
        this.subData.roomNumber = 1;
        layer.open({
            title: "生成房间",
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
                nowPage.httpService.post({
                    url:'/cms/building/createRoom',
                    data:nowPage.subData
                }).subscribe((data:any)=>{
                    layer.closeAll();
                    if(data.code==='0000'){
                        //生成成功
                       layer.msg(data.message,{
                           icon: '1',
                           time: 2000
                       },function(){
                           nowPage.loadCommunityData();
                       });
                    }else if(data.code==='9999'){
                        Utils.show(data.message);
                    }else{
                        Utils.show("系统异常，请联系管理员");
                    }
                });
            }
        });
    }

    /**
    * 加载楼栋数据
    */
    loadCommunityData(){
        this.httpService.pagination({
            url:'/cms/building/findBuilding',
            data:{
                communityId:this.communityId
            }
        });
    }

}
