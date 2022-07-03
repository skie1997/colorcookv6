import React, { PureComponent } from 'react';
import * as d3 from 'd3';
import { Layout,Button,Row, Col, Tooltip } from 'antd';
import { SketchPicker } from 'react-color';
import { WidthProvider, Responsive } from "react-grid-layout";
import  d3DefaultSpec from '@/charts/D3/spec';
import d3Channels from '@/charts/D3/channels';
import { getCategories, getAggregatedRows, getWidth } from '@/charts/D3/PieChart/helper';
import HttpUtil from '@/HttpUtil';
import ApiUtil from '@/ApiUtil';
import _ from "lodash";
import D3Container from "@/charts/D3/D3Container"
import RadarChart from "@/charts/D3/RadarChart2";
import './canvaspane.css';

import{ getStackedData as  getStackedDataArea, getSeries as getSeriesArea} from '@/charts/D3/AreaChart/helper'
import{ getStackedData as  getStackedDataBar, getSeries as getSeriesBar} from '@/charts/D3/BarChart/helper'
import{ getStackedData as  getStackedDataLine, getSeries as getSeriesLine} from '@/charts/D3/LineChart/helper'
import{ getAggregatedRows as  getAggregatedRowsPie, getCategories as getCategoriesPie} from '@/charts/D3/PieChart/helper'
import{ getAggregatedRows as  getAggregatedRowsScatter, getSeries as getSeriesScatter} from '@/charts/D3/ScatterPlot/helper'
import{ getStackedData as  getStackedDataTree, getSeries as getSeriesTree} from '@/charts/D3/TreeMap/helper'
import{ getStackedData as  getStackedDataRadar, getSeries as getSeriesRadar} from '@/charts/D3/RadarChart/helper'
import{ getData as getDataMap}from '@/charts/D3/Map/helper'

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const ReactGridLayout = WidthProvider(Responsive);
const { Header, Content} = Layout;

//初始化colorpicker style
const popover = {
  position: 'absolute',
  //position: 'relative',
  zIndex: '9999',
  // top: '-250px',
  right: '0px',
  bottom: '0px',
  left: '200px',
  marginTop:'50px',
  marginLeft:'-100px'
}

const cover = {
  position: 'fixed',
  zIndex: '9999',
  //position:
  top: '-100px',
  right: '0px',
  bottom: '0px',
  left: '0px',
}

const defaultcolorPicker = [];
      for(let i = 0; i < 40; i++){
        let temp = [];
        for(let j = 0; j< 40; j++){
          temp.push(false)
        }
        defaultcolorPicker.push(temp);
      }

export default class CanvasPane extends PureComponent {
 
  static defaultProps = {
    cols: { lg: 12, md: 10, sm: 8, xs: 6, xxs: 6 },
    rowHeight: 40,
  };
    constructor(props) {
      super(props);
      
      

      this.state = {
        // layouts: this.getFromLS("layouts") || {},
        layouts: {
          cols: { lg: 12, md: 10, sm: 8, xs: 6, xxs: 2 },
          rowHeight: 40,
          title: 'Start to make a new dashboard!'
        },
        // widgets:[]

        //更新colorPicker
        displayColorPicker: defaultcolorPicker,

        //推荐色盘
        presetColorsReplace: '',
      }

      this.selectChart = this.selectChart.bind(this)
      this.onLayoutChange = this.onLayoutChange.bind(this)
      // this.inputChange = this.inputChange.bind(this)
    }
    componentWillReceiveProps(props) {
     console.log('will',this.props.widgets)
  }
  
    getFromLS(key) {
      let ls = {};
      if (global.localStorage) {
        try {
          ls = JSON.parse(global.localStorage.getItem("rgl-4")) || {};
        } catch (e) {
          /*Ignore*/
        }
      }
      return ls[key];
    }
  
    saveToLS(key, value) {
      if (global.localStorage) {
        global.localStorage.setItem(
          "rgl-4",
          JSON.stringify({
            [key]: value
          })
        );
      }
    }

    selectChart = (i, spec, e) => {
      window.event.stopPropagation();
    //   console.log('scatterplottype',this.props.widgets[i].type)
    //   if (this.props.widgets[i].type === 'scatterplot') {

    //     console.log('scatterplottype2',this.props.widgets[i].type)
    //     this.props.switchData(1); //countrys.csv
    //     // dataindex = 1
    // }else if(this.props.widgets[i].type  === 'map'){
    //   console.log('scatterplottype3',this.props.widgets[i].type)
    //     this.props.switchData(2); //china.csv
    //     // dataindex = 2
    // }else{
    //   console.log('scatterplottype4',this.props.widgets[i].type)
    //     this.props.switchData(0); //car.csv
    // }
      
     
      
      //改变dataIndex
      this.props.switchData(this.props.widgets[i].dataIndex)

      //改变selectChartIndex
      this.props.selectChart(i);

      //改变edit mode
      this.props.changeEditMode(i);

     
      this.props.changeEditSpec(spec);

       //改变edit channels
       let channels = d3Channels(this.props.widgets[i].type);
       //注意这里是遍历字典 要按key查找
       let channelsName = Object.keys(channels);
                        
       for(let i = 0; i< channelsName.length; i++){
           channels[channelsName[i]]['isEncoding'] = true;
       }

      this.props.changeEditChannels(channels);

       //关闭chart mode
       this.props.changeChartMode(false);  

       
      //  e.nativeEvent.stopImmediatePropagation();
      

      


    }

    inputChange = (i, event) =>{

      let widgets = [...this.props.widgets];
        
        // for(let i = 0; i<widgets.length;i++){
        //     widgets[i].spec.style.colorset = currentColorset;
        // }
        if(!event || event.target==undefined){
          widgets[i].inputvalue = "Add some text11";
          
        }else{
          widgets[i].inputvalue = event.target.value;
        }
        this.props.changeMapping(widgets);

        
    }
    titleInputChange = (event) =>{
      let input = event.target.value;
      this.setState({
        title: input
      })
    }


    handleStyleClick = (i, fieldsIndex) =>{

      //打印日志
      HttpUtil.post(ApiUtil.API_COLOR_LOG, 'prepare for replacing color in legend')
      .then(re=>{         
      })
      .catch(error=>{
          console.log(error.message);
      })


      let displayColorPicker = this.state.displayColorPicker;
      console.log('displayColorPicker-styleclick',displayColorPicker)
      console.log('item-index',fieldsIndex)
      console.log('i',i)

      displayColorPicker[i][fieldsIndex] =true;
      this.setState({
        displayColorPicker: displayColorPicker
      });

      //颜色推荐
      let colorsetData = _.cloneDeep(this.props.currentColorset);

        for(let i=0; i < colorsetData.length; i++){
            let temp1 = colorsetData[i].replace(/rgb\(/, " ")
            let temp2 = temp1.replace(/\)/, " ")
            let temp3 = temp2.split(",")
            let temp4 = []
            temp4=temp3.map(function(data){
                return +data;
            });
            colorsetData[i] = temp4;
        }

        //前后端传输

        var data = []
        // setTimeout(()=> console.log('成功',data))

        HttpUtil.post(ApiUtil.API_COLOR_SUGESSTION, colorsetData)
            .then(re=>{
          
                data = re.data
                this.setState({
                    presetColorsReplace: data,
                });
                
            })
            .catch(error=>{
              
                console.log(error.message);
            })
            // .then(re =>this.props.changeLoading(false));



      //层级过深无法触发渲染时需要强制渲染
      this.forceUpdate();
     
    }


    inputOnBlur = ()=>{
     console.log('inputOnBlur')
    }
  
    inputOnFocus = ()=> {
      console.log('inputOnFocus')
    }
    startSearch = ()=> {
      console.log('startSearch')
    }
 

    handleStyleChange = (i,fieldsIndex,fieldsName, value) =>{
      //打印日志
      //判断是否选择的是推荐颜色
      //推荐的颜色组
      const presetColorsReplace = this.state.presetColorsReplace;

      let suggestion = []
        for(let i=0; i < presetColorsReplace.length; i++){
            let rgb = '';
            rgb = 'rgb(' + presetColorsReplace[i][0] + ','+ presetColorsReplace[i][1] + ','+presetColorsReplace[i][2] +')';       
            suggestion.push(rgb);       
            
        }
        let currentColorset = this.props.currentColorset;
        let chooseColor = 'rgb('+ value.rgb.r + ',' + value.rgb.g + ',' + value.rgb.b +')';
        let logStr = suggestion.indexOf(chooseColor)!=-1? 'replace color with suggestion in legend' : (currentColorset.indexOf(chooseColor)!=-1?'replace color with existed color in legend':'replace color by self in legend')
        //打印日志
      HttpUtil.post(ApiUtil.API_COLOR_LOG, logStr)
      .then(re=>{         
      })
      .catch(error=>{
          console.log(error.message);
      })

      let globalColorpair = [...this.props.globalColorpair]
      
      globalColorpair.forEach((pair, index)=>{
       
        if(pair[fieldsName]){
          pair[fieldsName] = 'rgb('+ value.rgb.r + ',' + value.rgb.g + ',' + value.rgb.b +')'
        }
      })
      this.props.changeGlobalColorpair(globalColorpair);
      
      let widgets = [...this.props.widgets];
      if(widgets[i].type == 'map' || widgets[i].type == 'heat map'){
        console.log('rightPoint-hange')
        if(fieldsIndex == 0){
          widgets[i].legendChangedColor['leftPoint'] = 'rgb('+ value.rgb.r + ',' + value.rgb.g + ',' + value.rgb.b +')';

        }else if(fieldsIndex == 1){
          
          widgets[i].legendChangedColor['rightPoint'] = 'rgb('+ value.rgb.r + ',' + value.rgb.g + ',' + value.rgb.b +')';
        }
      }
      this.props.changeMapping(widgets);
      
 
    }

    handleStyleClose = (i, fieldsIndex) =>{
      //打印日志
      HttpUtil.post(ApiUtil.API_COLOR_LOG, 'stop to replace color in legend')
      .then(re=>{         
      })
      .catch(error=>{
          console.log(error.message);
      })

  
      let displayColorPicker = this.state.displayColorPicker;
      displayColorPicker[i][fieldsIndex] = false;
      
      this.setState({
        displayColorPicker: displayColorPicker
      })
      this.forceUpdate();
    }

    selectElements(itemIndex, fieldIndex, e){
      // if(!e){
      //   var e=window.event;
      // }
      // console.log('selectedElement111');
      // var selectedElement=e.target;
      let displayColorPicker = this.state.displayColorPicker;
      // let itemIndex = $(selectedElement).attr("class").split('_')[1];
      // let fieldIndex = $(selectedElement).attr("class").split('_')[2];
      console.log('itemIndex', itemIndex)
      console.log('fieldIndex', fieldIndex)
      console.log('displayColorPicker',displayColorPicker)
      // console.log('$(selectedElement).attr("class")', d3.select('.colorPicker_' + `${itemIndex}`+'_'+ `${fieldIndex}`+' > *'))
      // d3.select('.colorPicker_' + `${itemIndex}`+'_'+ `${fieldIndex}`+' > *').style('position','absolute').style('left', e.clientX).style('top',e.clientY);
      
      displayColorPicker[itemIndex][fieldIndex] = true;
  
      this.setState({
        displayColorPicker: displayColorPicker
      });
      console.log('finish');
      let widgets = [...this.props.widgets];
      this.props.changeMapping(widgets);

    }


    generateDOM = (e) => {

      
      
      // console.log('e2',this.state.layouts)
      // console.log('generace',this.props.widgets);
      let widgets = [...this.props.widgets];
      let colormap = this.props.colormap;
  

      if(widgets.length == 0){
        return ;
      }

      
      
  
      return _.map(widgets, (item, i) => {
    
        // console.log('e.1111111')
        
        //Get categories
      const dataCategories = getCategories(this.props.dataList[item.dataIndex], item.spec.encoding);
      const categories = Object.keys(dataCategories);
      
      let cardFieldsList = [];
      let cardColorList = [];
      let minValue = 0;
      let maxValue = 0;
      if(item.type == 'map' || item.type == 'heat map'){
        cardFieldsList[0] = colormap[i].mapField[0]+'-minValue';
        cardFieldsList[1] = colormap[i].mapField[0]+'-maxValue';

        if(item.type == 'map'){
          if(item.legendChangedColor['leftPoint']!=''&&item.legendChangedColor['rightPoint']==''){
                let leftColor = item.legendChangedColor['leftPoint'];
                cardColorList.push(leftColor);
          }else{
                cardColorList.push('rgb(241,241,241)');
          }
          if(item.legendChangedColor['leftPoint']==''&&item.legendChangedColor['rightPoint']!=''){
            let rightColor = item.legendChangedColor['rightPoint'];
            cardColorList.push(rightColor);
          }else{
            let itemIndex = this.props.globalFieldsList.indexOf(colormap[i].mapField[0]);
            cardColorList.push(this.props.globalColorList[itemIndex]);
          }
        }
        if(item.type=='heat map'){
          if(item.legendChangedColor['leftPoint']!=''&&item.legendChangedColor['rightPoint']==''){
            let leftColor = item.legendChangedColor['leftPoint'];
            cardColorList.push(leftColor);
            }else{
              let itemIndex = this.props.globalFieldsList.indexOf(colormap[i].mapField[0]+'-min');
              cardColorList.push(this.props.globalColorList[itemIndex]);
            }
            if(item.legendChangedColor['leftPoint']==''&&item.legendChangedColor['rightPoint']!=''){
              let rightColor = item.legendChangedColor['rightPoint'];
              cardColorList.push(rightColor);
            }else{
              let itemIndex = this.props.globalFieldsList.indexOf(colormap[i].mapField[0]+'-max');
              cardColorList.push(this.props.globalColorList[itemIndex]);
            }
        }

        // if(item.type == 'map'){
        //   let parseData = this.props.dataList[item.dataIndex];
        //   let encodingData = getDataMap(parseData, item.spec.encoding);
        //   let values = encodingData.values;
        //   let encodingValue = Object.values(values);
        //   if (!_.isEmpty(item.spec.encoding.color)) {
        //     maxValue = d3.max(encodingValue);
        //     minValue = d3.min(encodingValue);
        //   }
        // }else{
        //   let data = this.props.dataList[item.dataIndex];
        //   var myGroups = d3.map(data, function(d){return d[item.spec.encoding.x.field];}).keys();
        //   var myVars = d3.map(data, function(d){return d[item.spec.encoding.y.field];}).keys();

        //   let heatData = new Array()

        //   for(let i = 0; i<myGroups.length; i++){
        //       for(let j = 0; j<myVars.length; j++){
        //           let xField = item.spec.encoding.x.field;
        //           let yField = item.spec.encoding.y.field;
        //           let colorField = item.spec.encoding.color.field;
        //           let heatDatai = new Array()
        //           heatDatai[xField] = myGroups[i]
        //           heatDatai[yField] = myVars[j]
        //           heatDatai[colorField] = 0
        //           heatData.push(heatDatai)

        //       }
        //   }
        //   for(let i = 0; i<data.length; i++){
        //       let index = myGroups.indexOf(data[i][item.spec.encoding.x.field])+1
        //       let index2 = myVars.indexOf(data[i][item.spec.encoding.y.field].toString())+1

        //       heatData[(index-1)*myVars.length+index2-1][item.spec.encoding.color.field] += data[i][item.spec.encoding.color.field]=='-'?0:parseInt(data[i][item.spec.encoding.color.field]);
        //   }
        //   let valueRange = d3.extent(heatData, function(d) { return (d[item.spec.encoding.color.field]);});
        //   minValue = valueRange[0];
        //   maxValue = valueRange[1]; 
        //   console.log('minValue-heat',minValue)
        //   console.log('maxValue-heat',maxValue)

        // }
        // function isLight (color){
        //       let labColor = d3.lab(color);
        //       console.log('WC',labColor)
        //       let hslColor = d3.hsl(color);
        //       let C = Math.sqrt(labColor.a*labColor.a  + labColor.b*labColor.b);
        //       let h = hslColor.h;
        //       let WC = 0;
        //       WC = -0.5 + 0.02*Math.pow(C, 1.07) * Math.cos((h - 50)/180 * Math.PI);
        //       console.log('WC',WC)
        //       if(WC > 0){
        //         return true
        //       }else{
        //         return false;
        //       }
        //     }
        
   
        // if(maxValue >= 0 && minValue < 0){
        //   if(item.legendChangedColor['leftPoint']!=''&&item.legendChangedColor['rightPoint']==''){
        //     let leftColor = item.legendChangedColor['leftPoint'];
        //     cardColorList.push(leftColor);
        //     let rightColor = d3.hsl(leftColor);

            
           
        //     if(isLight(rightColor)){
        //       let i = 0;
        //       while(isLight(rightColor)&&i<5){
        //         rightColor.h = (rightColor.h+60) % 360;
        //         i++;
        //         console.log('rightColor.h',rightColor.h)
        //       }
        //       // rightColor.s = rightColor.s<0.5? 0.8 - rightColor.s: 1.2 - rightColor.s;
        //       // rightColor.l = rightColor.l<0.5? 1 - rightColor.l: 1.2 - rightColor.l;
        //       rightColor.l = 1 - rightColor.l;
              
        //     }else{
        //       let i = 0;
        //       while(!isLight(rightColor)&&i<5){

        //           if(rightColor.h<0){
        //             rightColor.h+=360;
        //           }
        //           rightColor.h = (rightColor.h-60) % 360;
        //           console.log('rightColor.h',rightColor.h)
        //       }
        //       // rightColor.s = rightColor.s<0.5? 0.8 - rightColor.s: 1.2 - rightColor.s;
        //       // rightColor.l = rightColor.l<0.5? 1 - rightColor.l: 1.2 - rightColor.l;
        //       rightColor.l = 1 - rightColor.l;
        //     }
           
        //     rightColor = d3.rgb(rightColor);
        //     cardColorList.push(rightColor);
        //   }else if(item.legendChangedColor['rightPoint']!=''&&item.legendChangedColor['leftPoint']==''){
        //     let rightColor = item.legendChangedColor['rightPoint'];
            
        //     let leftColor = d3.hsl(rightColor);
        //     console.log('rightColor.h',leftColor.h)
        //     if(isLight(leftColor)){
        //       let i = 0;
        //       while(isLight(leftColor)&&i<5){
        //         leftColor.h = (leftColor.h+60) % 360;
        //         console.log('leftColor',leftColor)
        //         i++;
        //       }
        //       // leftColor.s = leftColor.s<0.5? 0.8 - leftColor.s: 1.2 - leftColor.s;
        //       // leftColor.l = leftColor.l<0.5? 1 - leftColor.l: 1.2 - leftColor.l;
        //       leftColor.l = 1 - leftColor.l;
              
        //     }else{
        //       let i = 0;
        //       while(!isLight(leftColor)&&i<5){
        //         if(leftColor.h<0){
        //           leftColor.h+=360;
        //         }
        //         leftColor.h = (leftColor.h-60) % 360;
        //         i++;
        //       }
        //       // leftColor.s = leftColor.s<0.5? 0.8 - leftColor.s: 1.2 - leftColor.s;
        //       // leftColor.l = leftColor.l<0.5? 1 - leftColor.l: 1.2 - leftColor.l;
        //       leftColor.l = 1 - leftColor.l;
        //     }
            
        //     leftColor = d3.rgb(leftColor);
        //     cardColorList.push(leftColor);

        //     cardColorList.push(rightColor);
        //   }else{
        //       let itemIndex = this.props.globalFieldsList.indexOf(colormap[i].mapField[0])
        //       let rightColor = this.props.globalColorList[itemIndex];      
        //       let leftColor = d3.hsl(rightColor);
          
        //       if(isLight(leftColor)){
        //         let i = 0;
        //         console.log('isLight-before',isLight(leftColor))
        //         console.log('leftColor.h',leftColor)
        //         while(isLight(leftColor)&&i<10){
        //           leftColor.h = (leftColor.h+60) % 360;
                  
        //           i++;
        //           console.log('isLight',isLight(leftColor))
        //           console.log('leftColor.h',leftColor)
        //         }
        //         // leftColor.s = leftColor.s<0.5? 0.8 - leftColor.s: 1.2 - leftColor.s;
        //       // leftColor.l = leftColor.l<0.5? 1 - leftColor.l: 1.2 - leftColor.l;
        //       leftColor.l = 1 - leftColor.l;
                
        //       }else{
        //         let i = 0;
                
        //         while(!isLight(leftColor)&&i<10){
        //           if(leftColor.h<0){
        //             leftColor.h+=360;
        //           }
        //           leftColor.h = (leftColor.h-60) % 360;
        //           i++;
        //         }
        //         // leftColor.s = leftColor.s<0.5? 0.8 - leftColor.s: 1.2 - leftColor.s;
        //       // leftColor.l = leftColor.l<0.5? 1 - leftColor.l: 1.2 - leftColor.l;
        //       leftColor.l = 1 - leftColor.l;
        //       }
              
     
        //       leftColor = d3.rgb(leftColor);
        //       cardColorList.push(leftColor);
        //       cardColorList.push(rightColor);
        //   }
        // }else if(minValue >= 0){
      
        //   let leftColor = 'rgb(241,241,241)';
        //   let rightColor;
        //   if(item.legendChangedColor['rightPoint']!=''){
        //     rightColor = item.legendChangedColor['rightPoint'];
        //   }else{
        //     let itemIndex = this.props.globalFieldsList.indexOf(colormap[i].mapField[0])
        //     rightColor = this.props.globalColorList[itemIndex];      
        //   }
        //   cardColorList.push(leftColor)
        //   cardColorList.push(rightColor)
        // }else if(maxValue <= 0){
        //   let rightColor = 'rgb(241,241,241)';
        //   let leftColor;
        //   if(item.legendChangedColor['leftPoint']!=''){
        //     leftColor = item.legendChangedColor['rightPoint'];
        //   }else{
        //     let itemIndex = this.props.globalFieldsList.indexOf(colormap[i].mapField[0])
        //     leftColor = this.props.globalColorList[itemIndex];      
        //   }
        //   cardColorList.push(leftColor)
        //   cardColorList.push(rightColor)
        // }


      }else{
        cardFieldsList = colormap[i].fieldsList;
        cardFieldsList.forEach(fieldsItem=>{
          let itemIndex = this.props.globalFieldsList.indexOf(fieldsItem)
          cardColorList.push(this.props.globalColorList[itemIndex])
        })
      }


      
      //推荐的颜色组
      const presetColorsReplace = this.state.presetColorsReplace;
      let maxNum;
      if(presetColorsReplace.length<18){
        maxNum = presetColorsReplace.length
      }else{
        maxNum =18
      }
      let suggestion = []
        for(let i=0; i < maxNum; i++){
            let rgb = '';
            rgb = 'rgb(' + presetColorsReplace[i][0] + ','+ presetColorsReplace[i][1] + ','+presetColorsReplace[i][2] +')';       
            suggestion.push(rgb);       
            
        }
        // if(suggestion.length<18){
        //   for(let i = 0; i<18-suggestion.length;i++){
        //     suggestion.push('')
        //   }
        // }
        
      let currentColorset = this.props.currentColorset;
      // for(let i=0; i < currentColorset.length; i++){
      
      //   suggestion.push(currentColorset[i]);       
        
      // }




        let component = (
          <D3Container
            type={item.type}
            itemIndex={i}
            // // item.dataIndex,
            // // item.category, // category
            // // item.type, //type
            data={this.props.dataList[item.dataIndex]}
            spec={item.spec} //spec
            categories = {Object.keys(dataCategories)}
            // colormap={this.state.colormap}
            size={!widgets[i]? {w:0,h:0}:{w:widgets[i].w,h:widgets[i].h}}
            globalColorpair = {this.props.globalColorpair}
            cardFieldsList = {cardFieldsList}
            cardColorList = {cardColorList}
            textcolor={this.props.textColor}
            cardcolor={this.props.cardColor}
            cardId={'chart'+ item['i']}

            selectElements={this.handleStyleClick.bind(this)}
            // option={option}
            // notMerge={true}
            // lazyUpdate={true}
            style={{width: '100%',height:'100%'}}
          />
        )
        return (
          // <div style={{width:'100px',height:'50px'}}>
          // <div ref='carddiv' className="carddiv" style={{backgroundColor: this.props.cardColor, boxShadow:'0px 0px 5px 2px '+`${this.props.shadowColor}`, textAlign: 'center',pointerEvents:'box-none'}} key={item.i} data-grid={item} onClick={()=>this.selectChart(i, item.spec)}>
          // <div ref='carddiv' className="carddiv" style={{backgroundColor: this.props.cardColor, border:!this.props.chartMode&&this.props.editMode==i? '1px solid '+`${this.props.textColor}`:'1px solid '+`${this.props.shadowColor}`, textAlign: 'center',pointerEvents:'box-none'}} key={item.i} data-grid={item} onClick={()=>this.selectChart(i, item.spec)}>
          <div ref='carddiv' className="carddiv" style={{ textAlign: 'center',pointerEvents:'box-none'}} key={item.i} data-grid={item} onClick={()=>this.selectChart(i, item.spec)}>  
          <input type="text" id="myVal"  
             onPressEnter={this.startSearch}         
             onBlur={this.inputOnBlur }
             onFocus={this.inputOnFocus }
            value={!this.props.widgets[i].inputvalue? this.props.widgets[i].type: this.props.widgets[i].inputvalue} onChange={this.inputChange.bind(this,i)} 
            style={{backgroundColor: this.props.cardColor, color: this.props.textColor}}></input>
            <span className='remove' style={{color:this.props.textColor}} onClick={this.onRemoveItem.bind(this, i)}>x</span>
            {component}
            <div style={{position:'absolute',bottom:'0', width:'100%',display:'flex',justifyContent:'center'}}>
            <Row  type="flex" justify="space-around" align="middle" style={{marginBottom:'-8px', width:'100%'}}>
          {
            // if(cardFieldsList !== [])
              cardFieldsList.map((fieldsItem, fieldsIndex) =>{
                let left1,left2;
                if(item.type=='map'||item.type=='heat map'){
                  left1 = '-40px'
                  left2 = '-15px'
                }else if(item.type=='pie chart'){
                  left1='-10px'
                  left2 = '-5px'
                }else if(item.type=='bar chart'){
                  left1='-12px'
                  left2 = '-5px'
                }else if(item.type=='area chart'){
                  left1='-17px'
                  left2 = '-5px'
                }
                else{
                  left1 = '-22px'
                  left2 = '-5px'
                }
                  return (
                    <div style={{width:'40px'}}>
                      <Col span={2} style={{marginRight: '20px',marginLeft:left1}}> 
                          
                          <Button size='small'  onClick={ this.handleStyleClick.bind(this, i, fieldsIndex)} style={{width: '13px', height: '13px', marginTop:'-10px',background: cardColorList[fieldsIndex], border:"#ffffff",display:'none'}}></Button>     
                          {
                          

                          this.state.displayColorPicker[i][fieldsIndex]==true ? 
                            <div style={ popover } className={'colorPicker_' + `${i}`+'_'+ `${fieldsIndex}`}>
                            <div style={ cover } onClick={ this.handleStyleClose.bind(this, i,fieldsIndex) } />
                            <SketchPicker width={150} color={cardColorList[fieldsIndex]} presetColors = {suggestion} presetColors2 = {currentColorset}  style={{marginTop:'50px', marginLeft:'-160px', width:'150px'}} onChange={this.handleStyleChange.bind(this,i, fieldsIndex, fieldsItem)} />
                            </div>
                          :null 
                          }
                      </Col>
                      <Col span={2} style={{display:'none'}}>
                        {/* <Tooltip title={fieldsItem}> */}

                          {/* <div style={{width:'40px',textAlign:'left',fontSize:'12px',marginTop:'-12px',color:this.props.textColor,whiteSpace:'nowrap',textOverflow:'ellipsis',overflow:'hidden'}} title={fieldsItem}> */}
                          <div style={{width:'40px',textAlign:'left',fontSize:'10px',marginTop:'-12px',marginLeft:left2,color:this.props.textColor,whiteSpace:'nowrap'}} title={fieldsItem}>
                            {fieldsItem}
                            {/* <p style={{textAlign:'left', color:this.props.textColor}}>{fieldsItem}</p> */}
                          </div>
                      {/* </Tooltip> */}
                        
                        </Col>
                      </div>
                      
                  );
              })
          }
          
        
          </Row>
          </div>
         
          </div>
          
          // </div>
        );
      });
    
    };
  
    // addChart(type) {
    //   const addItem = {
    //     x: (this.state.widgets.length * 3) % (this.state.cols || 12),
    //     y: Infinity, // puts it at the bottom
    //     w: 3,
    //     h: 2,
    //     i: new Date().getTime().toString(),
    //   };
    //   this.setState(
    //     {
    //       widgets: this.state.widgets.concat({
    //         ...addItem,
    //         type,
    //       }),
    //     },
    //   );
    // };
  
    onRemoveItem(i) {

      
      
      
      // this.props.changeColormap(this.props.colormap.filter((item,index) => index !=i));


      console.log('colormap-dele', this.props.colormap)
        
      let data = []

        
        // console.log('this.props.colormap',this.props.colormap)
        let colorData = {'colormap': this.props.colormap.filter((item,index) => index !=i), 'backgroundcolor': this.props.backgroundColor, 'currentColorset': this.props.currentColorset}
        console.log('colorData',this.props.currentColorset)

        this.props.changeLoading(true);
        HttpUtil.post(ApiUtil.API_COLOR_COLORATION, colorData)
            .then(re=>{
              

                data = re.data
                console.log('dataColor',data)
                this.props.changeGlobalColorpair(data)
                    
            })
            .catch(error=>{
              
                console.log(error.message);
            })
            .then(re=>{
              //打开chart mode - 恢复默认bartchart
              let charttype = 'bar chart'
              
              this.props.changeChartMode(charttype)

              //改变dataIndex
              this.props.switchData(0)

              //关闭edit mode
              this.props.changeEditMode(false);

              // 改变generate channels
              let channels = d3Channels(charttype);
              //注意这里是遍历字典 要按key查找
              let channelsName = Object.keys(channels);
                              
              for(let i = 0; i< channelsName.length; i++){
                  channels[channelsName[i]]['isEncoding'] = false;
              }

              this.props.changeGenerateChannels(d3Channels(charttype))
              this.props.changeGenerateSpec(d3DefaultSpec(charttype))

              this.props.removeChart(this.props.widgets.filter((item,index) => index !=i));
              this.props.changeColormap(this.props.colormap.filter((item,index) => index !=i));  
              this.props.changeLoading(false);
            });  
            // this.props.removeChart(this.props.widgets.filter((item,index) => index !=i)) 
      // console.log('remove',this.state.widgets)
      // this.setState({
      //   widgets: this.state.widgets.filter((item,index) => index !=i)
      // });
  
    }
  
    onLayoutChange = (layout, layouts) =>{
     
      //浅拷贝，可以直接对props进行修改，而且调用changemapping页面会重新更新，深拷贝做不到这样
      let widgets = JSON.parse(JSON.stringify(this.props.widgets));
        
      // for(let i = 0; i<widgets.length;i++){
      //     widgets[i].spec.style.colorset = currentColorset;
      // }

      console.log('layouts-change',layouts)
      widgets.forEach((item,index)=>{
       
          // console.log('item',item);
          // console.log('index',index)
          item.w = layouts.sm[index].w;
          item.h = layouts.sm[index].h;
          item.x = layouts.sm[index].x;
          item.y = layouts.sm[index].y;
      })
      this.props.changeMapping(widgets);

      // this.props.changeLayout(layouts);
      // this.forceUpdate();
      // this.setState();

      
      this.saveToLS("layouts", layouts);
      this.setState({ layouts }
        );
    }
    backToInit =() =>{
      this.props.changeChartMode('bar chart');
      this.props.changeGenerateChannels(d3Channels('bar chart'))
      this.props.changeGenerateSpec(d3DefaultSpec('bar chart'))
      this.props.changeEditMode(false)
      this.props.changeEditChannels('')
      this.props.changeEditSpec('')
    
    }
  
    render() {
    console.log('cardColor-render',this.props.cardColor)
     return(
      //  <Layout onClick={this.backToInit.bind(this)} > 
      <Layout>
        {/* <Header style={{ height:'30px'}}> */}
       
        {/* </Header> */}
        <Content className='dashboard' id = 'layoutDash' style={{backgroundColor: this.props.backgroundColor}}>
        {/* <input type="text" 
            //  placeholder="Start to make a dashboard!"
             value={this.state.title} onChange={this.titleInputChange.bind(this)} 
             style={{backgroundColor: this.props.backgroundColor, color: this.props.textColor, width:'100%',marginTop:'40px', fontSize:'14px'}}></input> */}
          <div id="layoutStage" style={{ background: '#fff', padding: 20 }}>
            <ResponsiveReactGridLayout
              style={{width:'800px',height:'828px',marginLeft:'85px',marginTop:'0px'}}
              className="layout"
         
              layouts={this.state.layouts}
              onLayoutChange={(layout, layouts) =>
                this.onLayoutChange(layout, layouts)
              }
            >
              {this.generateDOM()}
            </ResponsiveReactGridLayout>
          </div>
        </Content>
      </Layout>
     )}
  }