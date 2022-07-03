import * as d3 from 'd3';
import './style.css';
import { getStackedData, getSeries, getAggregatedRows, getWidth } from './helper';
import _ ,{ mean }from 'lodash';
import { parse } from 'qs';

const draw = (props) => {
    let a = document.createElement("div");
    if (!props.onCanvas) {
        d3.select('.'+props.chartId+' > *').remove();
        a = '.'+props.chartId;
    }

    

    // d3.select('.vis-heatmap').style('background-color',backcolor);

    
    const margin = { top: 10, right: 10, bottom: 40, left: 40 };
    const width = props.size.w * 800/8;
    const height = props.size.h * 400/3;

    const fieldsList = props.cardFieldsList;
    const colorList = props.cardColorList;
    const textcolor = props.textcolor;

    console.log('colorListttt',colorList)

    


    const globalColorscale = d3.scaleOrdinal()
        .domain(fieldsList)
        .range(colorList);
    
    



    let svg = d3.select(a).append('svg')
            .attr('width',width )
            .attr('height',height )
            .append("g")
            .attr("transform", "translate(" +55 + "," + 5 + ")");
    
    
    const encoding = props.spec.encoding;
    if (_.isEmpty(encoding) || !('x' in encoding) || !('y' in encoding) || _.isEmpty(encoding.x) || _.isEmpty(encoding.y.field) ) {
        svg.append("g"); 
        return svg;
    }

    let data = props.data;
    

    


    var myGroups = d3.map(data, function(d){return d[encoding.x.field];}).keys();
    var myVars = d3.map(data, function(d){return d[encoding.y.field];}).keys();

    let heatData = new Array()
    

    for(let i = 0; i<myGroups.length; i++){
        for(let j = 0; j<myVars.length; j++){
            let xField = encoding.x.field;
            let yField = encoding.y.field;
            let colorField = encoding.color.field;
            let heatDatai = new Array()
            heatDatai[xField] = myGroups[i]
            heatDatai[yField] = myVars[j]
            heatDatai[colorField] = 0
            heatData.push(heatDatai)

        }
    }
    
    console.log('heatData',heatData)
    


    for(let i = 0; i<data.length; i++){
        let index = myGroups.indexOf(data[i][encoding.x.field])+1
        let index2 = myVars.indexOf(data[i][encoding.y.field].toString())+1

        heatData[(index-1)*myVars.length + index2-1][encoding.color.field] += data[i][encoding.color.field]=='-'?0:parseInt(data[i][encoding.color.field]);
    } 
    let minColor, maxColor;

    let colorList0 = colorList[0].split(/[(),]/)
    let r1 = parseInt(colorList0[1])
    let g1 = parseInt(colorList0[2])
    let b1 = parseInt(colorList0[3])
    let G1 = r1*0.299 + g1*0.587 + b1*0.114;

    let colorList1 = colorList[1].split(/[(),]/)
    let r2 = parseInt(colorList1[1])
    let g2 = parseInt(colorList1[2])
    let b2 = parseInt(colorList1[3])
    let G2 = r2*0.299 + g2*0.587 + b2*0.114;

    if(G1 > G2){
        minColor = colorList[1];
        maxColor = colorList[0];
    }else{
        minColor = colorList[0];
        maxColor = colorList[1]
    }

   
    let midColor = d3.rgb(241,241,241);
   
    // minColor = d3.rgb(203,20,78);
    
    // midColor = d3.rgb(241,241,241);
    // maxColor = d3.rgb(33,177,135);
    // let minColor = d3.rgb(248,188,100);
    
    // let midColor = d3.rgb(241,241,241);
    // let maxColor = d3.rgb(67,190,245);

    // let minColor = d3.rgb(197,72,236);
    
    // let midColor = d3.rgb(241,241,241);
    // let maxColor = d3.rgb(146,69,135);

    console.log('colorList',colorList)
    // const midColor = 

    const valueRange = d3.extent(heatData, function(d) { return (d[encoding.color.field]);});

    const minValue = valueRange[0];
    const maxValue = valueRange[1];
    const midValue = (valueRange[0]+ valueRange[1])/2

    console.log('minValue',minValue)
    console.log('maxValue',maxValue)


    let scale;
    let isLogScale = false;
    let computeColor;
    if (minValue >= 0) { //如果都是大于0的数，就直接从白到红即可，不需要蓝色
        computeColor = d3.interpolate(minColor, maxColor);
        // let logScale = d3.scaleLog().domain([1, maxValue]); //默认值域range是[0, 1]
        // scale = logScale;
        scale = d3.scaleLinear().domain([minValue, maxValue]);
        // isLogScale = true;
    } else if (minValue < 0 && maxValue >= 0) { //如果数据中有负数，有正数，取绝对值最大的值最大值，取相反数为最小值；负数为蓝，正数为红, 零为白色
      
        computeColor = d3.scaleLinear()
            .domain([minValue, midValue, maxValue])
            .range([minColor, midColor,maxColor])

    } else {
        computeColor = d3.interpolate(minColor, maxColor);
        // let logScale = d3.scaleLog().domain([1, maxValue]); //默认值域range是[0, 1]
        // scale = logScale;
        scale = d3.scaleLinear().domain([minValue, maxValue]);
    }

    // Build X scales and axis:
    var x = d3.scaleBand()
        .range([ 0, width-95 ])
        .domain(myGroups)
        .padding(0.05);
    svg.append("g")
        .style('font-size','8px')
        // .style('font-family', 'Arial')
        .style("color",textcolor)
        .attr("transform", "translate(5," + 70 + ")")
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll('text')
        .style('font-size','8px')
        .text(function(d,i){
            // if(d.toString().length ==3 ){
            //     return  '19'+d.toString().slice(1,3)
            // }
            // if(d.toString().length ==4 ){
            //     return  '19'+d.toString().slice(2,4)
            // }
            return  d.toString()
        })
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    svg.select(".domain").remove()
        

// Build Y scales and axis:
    var y = d3.scaleBand()
        .range([ height-60, 0 ])
        .domain(myVars)
        .padding(0.05);
    svg.append("g")
        .style('font-size','8px')
        .style('color',textcolor)
        // .attr("stroke",textcolor)
        // .style('font-family', 'Arial')
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove()


    var valueScale = d3.scaleLinear()
        // .domain([1,50,100])
        //.domain([1,100])
        //extent返回数组中的最大值最小值
        .domain(d3.extent(data, function(d) { return (d[encoding.color.field]);}))
        // .range(colorset);

    
    // add the squares
  svg.selectAll()
    .data(heatData)
    .enter()
    .append("rect")
        .attr("x", function(d) { 
            console.log('d-heat',d)
            return x(d[encoding.x.field]) })
        .attr("y", function(d) { return y(d[encoding.y.field]) })
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("width", x.bandwidth()-2 )
        .attr("height", y.bandwidth()-2 )
        .attr("value", function(d) { return d[encoding.color.field]} )
        // .style("fill", function(d) {    
        //     if(!d[encoding.color.field]) return 'rgb(227,228,229)'
        //     let color = computeColor(scale(d[encoding.color.field]));
        //     console.log('color-heatmap',color)
        .style("fill", function(d) {   
            console.log('d-heatmapppp',d) 
            if(!d[encoding.color.field]) return 'rgb(227,228,229)'
            let color;
            if(minValue<0 && maxValue>=0){
                color = computeColor(d[encoding.color.field.toString()]);
            }else{  
                color = computeColor(scale(d[encoding.color.field.toString()]));
            }
            
            console.log('color-heatmap',d[encoding.color.field.toString()])
            if(color == undefined){
                return ''
            }
            //console.log("logScale", d.properties.name,value,scale(value),color)
            return color.toString()
        })
       // .style("stroke-width", 4)
        .style("opacity", 1)

    return svg;

      
}

export default draw;