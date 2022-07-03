import * as d3 from 'd3';
import { getStackedData, getSeries, getAggregatedRows, getWidth } from './helper';
import _, { mean } from 'lodash';
import './style.css';
import dendrogram from '@/datasets/treeMap/dendrogram';

const config = {
        "legend-text-color": "#666"
}

const draw = (props) => {
    let a = document.createElement("div");
    if (!props.onCanvas) {
      d3.select('.'+props.chartId+' > *').remove();
      a = '.'+props.chartId;
    }

    let tooltip = d3.select('body')
                .append('div')
                .style('background-color','#fff')
                .style('border','1px solid #000')
                .style('position', 'absolute')
                .style('z-index', '10')
                .style('color', '#000')
                .style('visibility', 'hidden')   // 是否可见（一开始设置为隐藏）
                .style('font-size', '12px')


    //默认卡片背景
    const margin = { top: 10, right: 10, bottom: 40, left: 40 };
    const width = props.size.w * 800/8;
    const height = props.size.h * 400/3;

    const fieldsList = props.cardFieldsList;
    const colorList = props.cardColorList;
    const textcolor = props.textcolor;
    



    const globalColorscale = d3.scaleOrdinal()
        .domain(fieldsList)
        .range(colorList);

    
    // d3.select('.vis-treemap').style('background-color',backcolor);

    // const colorset = props.colorset;
//     const data = props.data;
    // const margin = {top: 0, right: 0, bottom: 20, left: 10};
    // const width = props.size.w * 800/6;
    // const height = props.size.h * 400/3;
   
    const chartWidth = width,
        chartHeight = height - 60;

    let svg = d3.select(a)
      //在svg之前添加center元素以保证svg居中显示
      .append("center")
            .append('svg')
            .attr('width',width-20)
            .attr('height',height)
            .append("g")
            .attr("transform", "translate(" +0 + "," + 10 + ")");

            // svg.append("rect")
            // .attr("height", width + margin.left + margin.right)
            // .attr("width", height + margin.top + margin.bottom)
            // .attr("stroke-width","0px")
            // .attr("fill",cardcolor)
            // .attr("transform", "translate(-" + margin.left + ",-" + margin.top + ")");
    
    // Get Encoding
    const encoding = props.spec.encoding;
    if (_.isEmpty(encoding) || !('Hierarchy' in encoding) || !('size' in encoding) || _.isEmpty(encoding.Hierarchy) || _.isEmpty(encoding.size.field) ) {
        svg.append("g"); 
        return svg;
    }
    let hasSeries = ('color' in encoding) && ('field' in encoding.color);
    
    
    // Process Data
    let data = props.data;

    
    let stackedData = [];
    let dataSeries = [];
    let series = [];
    if (hasSeries) {
        dataSeries = getSeries(data, encoding);
        stackedData = getStackedData(data, encoding);
        series = Object.keys(dataSeries);
    } else {
        data = getAggregatedRows(data, encoding);
    }

  //  console.log('data_o',stackedData)
    
    const dataTree = {}
    const dataProcessed = []
    let dataMin = 10000;
    let dataMax = 0;
    for(let i=0; i<stackedData.length; i++){
        let tempTree = {}
        tempTree.name = stackedData[i].key
        let temp1 = [];
        let temp1Data = stackedData[i]
        for(let j=0; j<temp1Data.length; j++){
            let temp2 = {};
            let temp2Data = temp1Data[j];
            temp2.name = temp2Data.data.x;
            temp2.value = temp2Data[1] - temp2Data[0];
            if(temp2.value >= dataMax){
                dataMax = temp2.value;
            }else if(temp2.value <= dataMin){
                dataMin = temp2.value;
            }
            // temp2.value = 1.0;
            temp1.push(temp2);
        }
        tempTree.children = temp1
        dataProcessed.push(tempTree);  
    }

    dataTree.name = 'treeData'
    dataTree.children = dataProcessed
    console.log('data-tree',dataProcessed)

    
            //     let color = d3.scaleOrdinal(colorset);
    // const data = dendrogram;
    // const chartWidth = width,
    //     chartHeight = height - 40;//plus legend height

    // Color channel
    // const style = props.spec.style;
    // let colorset = style.colorset;

    // const color = d3.scaleOrdinal()
    // .domain(series)
    // .range(colorset);
  const treemap = d3
    .treemap()
    .tile(d3.treemapBinary)
    .size([width-25, height-50])
    .round(true)
    //.padding(2);
    .paddingOuter(3)
    .paddingInner(1);//
  const root = d3.hierarchy(dataTree).sum(d => d.value);
  const tree = treemap(root); // 获取treemap结构树
  const leaves = tree.leaves(); // 将生成的树形结构转化成叶子节点数组

  const g = svg
    .selectAll('.rects')
    .data(leaves)
    .enter()
    .append('g')
    .attr('class', 'rects');

  // 添加矩阵
  g.append('rect')
    .attr('x', d => {
      console.log('tree-d',d)
      return d.x0
    })
    .attr('y', d => d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .style('fill', function(d,i){
        return globalColorscale(d.parent.data.name)
    })
    // .attr('stroke','none');
   // .style('stroke', '#cccccc');

  //添加文字描述

   g.append('text')
    .attr('id','text1')
    .attr('x', d => (d.x1 - d.x0) / 8 + d.x0)
    .attr('y', d => (d.y1 - d.y0) / 4 + d.y0)
    .attr('dx', d => {
      return `${-d.data.name.length / 2}px`;
    })
    .attr('dy', () => {
      return '0em';
    }) 
    // .text(d => {
    //     if(d.value) //去除冗余数据
    //     // return `${encoding.color.field}`+ ": " + `${d.parent.data.name}`+ "\r"
    //     //  +`${encoding.Hierarchy.field}`+ ": "+`${d.data.name}`+ "\r"
    //     //  + `${encoding.size.field}`+ ": "+ `${Math.round(d.value * 100) / 100}`;
    //     return  `${d.parent.data.name}`+ "\r  "
   
    //     })
    .attr('font-size', d => {
      return 0
      // return `${11 - d.depth}px`;
    })
    // .attr("stroke",textcolor)
   .style('fill', textcolor)
        .text(function(d,i){
          if(d.value){
            let text1 = `${d.parent.data.name}`+ "\r  ";
            return text1.length > 1? text1.slice(0,2)+'..':text1
          }else{
            return ''
          }
            
        })
        .style('width','10px')
        .on('mouseover', function (d, i) {
            console.log('d.text',this.width)
            return tooltip.style('visibility', 'visible').text(`${d.parent.data.name}`+ "\n  "+`${encoding.Hierarchy.field}`+ ": "+`${d.data.name}`+ "\n"+`${encoding.size.field}`+ ": "+ `${Math.round(d.value * 100) / 100}`)
          })
          .on('mousemove', function (d, i) {
            return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
          })
          .on('mouseout', function (d, i) {
            return tooltip.style('visibility', 'hidden')
          });;

   g.append('text')
   .attr('id','text2')
   .attr('x', d => (d.x1 - d.x0) / 8 + d.x0)
   .attr('y', d => (d.y1 - d.y0) / 4 + d.y0)
   .attr('dx', d => {
     return `${-d.data.name.length / 2}px`;
   })
   .attr('dy', () => {
     return '1em';
   }) 
   .text(d => {
       if(d.value) //去除冗余数据
       return `${encoding.Hierarchy.field}`+ ": "+`${d.data.name}`+ "\r"
   
       })
   .attr('font-size', d => {
     return `${9 - d.depth}px`;
   })
   .style('fill', textcolor)
        .text(function(d,i){
          if(d.value){
            let text1 = `${encoding.Hierarchy.field}`+ ": "+`${d.data.name}`+ "\r";
            return text1.length > 1? text1.slice(0,2)+'..':text1
          }else{
            return ''
          }
            
        })
        .style('width','10px')
        .on('mouseover', function (d, i) {
            console.log('d.text',this.width)
            return tooltip.style('visibility', 'visible').text(`${d.parent.data.name}`+ "\n  "+`${encoding.Hierarchy.field}`+ ": "+`${d.data.name}`+ "\n"+`${encoding.size.field}`+ ": "+ `${Math.round(d.value * 100) / 100}`)
          })
          .on('mousemove', function (d, i) {
            return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
          })
          .on('mouseout', function (d, i) {
            return tooltip.style('visibility', 'hidden')
          });


   g.append('text')
   .attr('id','text3')
   .attr('x', d => (d.x1 - d.x0) / 8 + d.x0)
   .attr('y', d => (d.y1 - d.y0) / 4 + d.y0)
   .attr('dx', d => {
     return `${-d.data.name.length / 2}px`;
   })
   .attr('dy', () => {
     return '2.2em';
   }) 
  //  .text(d => {
  //      if(d.value) //去除冗余数据
  //     //  return "MPG:"+ `${Math.round(d.value * 100) / 100}`;
  //     return tooltip.style('visibility', 'visible').text(`${d.parent.data.name}`+ "\r  "+`${encoding.Hierarchy.field}`+ ": "+`${d.data.name}`+ "\r"+`${encoding.size.field}`+ ": "+ `${Math.round(d.value * 100) / 100}`)
   
  //      })
   .attr('font-size', d => {
     return `${9 - d.depth}px`;
   })
   .style('fill', textcolor)
        .text(function(d,i){
          if(d.value){
            let text1 = `${encoding.size.field}`+ ": "+ `${Math.round(d.value * 100) / 100}`;
            return text1.length > 1? text1.slice(0,2)+'..':text1
          }else{
            return ''
          }
            
        })
        .style('width','10px')
        .on('mouseover', function (d, i) {
            console.log('d.text',this.width)
            return tooltip.style('visibility', 'visible').text(`${d.parent.data.name}`+ "\n  "+`${encoding.Hierarchy.field}`+ ": "+`${d.data.name}`+ "\n"+`${encoding.size.field}`+ ": "+ `${Math.round(d.value * 100) / 100}`)
          })
          .on('mousemove', function (d, i) {
            return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
          })
          .on('mouseout', function (d, i) {
            return tooltip.style('visibility', 'hidden')
          });

//   g.append('text')
//     .attr('x', d => (d.x1 - d.x0) / 4 + d.x0)
//     .attr('y', d => (d.y1 - d.y0) / 4 + d.y0)
//     .attr('dx', d => {
//       return `${-(d.value.toString().length + 2) / 4}em`;
//     })
//     .attr('dy', () => {
//       return '1em';
//     })
//     .text(d => {
//       return `(${d.value})`;
//     })
//     .attr('font-size', d => {
//       return `${14 - d.depth}px`;
//     })
//     .attr('fill', '#ffffff');

        // var leaves = ["boss1", "boss2", "boss3"]
        // prepare a color scale
        // var color = d3.scaleOrdinal()
        // .domain(root.leaves())
        // // .range(['ffd92f', 'e78ac3', 'fc8d62'])  //e78ac3a6d854ffd92fe5c494b3b3b3
        // .range(colorset)

        // let leaves = root.leaves()
        // console.log('leaves',leaves)

        // var opacity = d3.scaleLinear()
        //         .domain([10, 30])
        //         .range([.5,1])

        // var perimeter = new Array();
        // for(var i=0;i<leaves.length;i++){
        //         perimeter[leaves[i]] = 0;
        // }

        // console.log('perimeter',perimeter)
        
        // let chart = svg.append("g").attr("class", "chart"),
        // content = chart.append("g")
        //     .attr("class", "content")
        //     .attr("chartWidth", chartWidth)
        //     .attr("chartHeight", chartHeight)
        //     .attr("clip-path", "url(#clip-rect)"),
        // legend = svg.append("g");

        // // use this information to add rectangles:
        // content.selectAll("rect")
        // .data(leaves)
        // .enter()
        // .append("rect")
        // .attr('x', function (d) { return d.x0; })
        // .attr('y', function (d) { return d.y0; })
        // .attr('width', function (d) { return d.x1 - d.x0; })
        // .attr('height', function (d) { return d.y1 - d.y0; })
        // .style("stroke", "black")
        // .style("fill", function(d){ 
        //         perimeter[d.parent.data.name] = perimeter[d.parent.data.name] + 2*(d.x1 - d.x0) + 2*(d.y1 - d.y0);
        //         console.log('color(d.parent.data.name)',color(d.parent.data.name))
        //         return color(d.parent.data.name)} )
        // // .style("opacity", function(d){ return opacity(d.data.value)})

        // // and to add the text labels
        // content
        // .selectAll("text")
        // .data(root.leaves())
        // .enter()
        // .append("text")
        // .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
        // .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
        // .text(function(d){ return d.data.name.replace('mister_','') })
        // .attr("font-size", "19px")
        // .attr("fill", "white")

        // // and to add the text labels
        // svg
        // .selectAll("vals")
        // .data(root.leaves())
        // .enter()
        // .append("text")
        // .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
        // .attr("y", function(d){ return d.y0+35})    // +20 to adjust position (lower)
        // // .attr("x", function(d){ return d.x0+15})    // +10 to adjust position (more right)
        // // .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
        // .text(function(d){ return d.data.value })
        // .attr("font-size", "12px")
        // .attr("fill", "white")

        // /** show legend **/
        // // var colorSet = getSeries(data, encoding);
        // var colorSet = root.leaves();
        // console.log("colorSet...",colorSet)
        // var legends = legend.selectAll("legend_color")
        //     .data(colorSet)
        //     .enter().append("g")
        //     .attr("class", "legend_color")
        //     .attr('transform', (d, i) =>`translate(${10}, 0)`);//i * 80 + (chartWidth - 80 * colorSet.length)/2
        // // legends.append("circle")
        // //     .attr("fill", d => color(d))
        // //     .attr("r", 6)
        // //     .attr("cy", -5);
        // legends.append("rect")
        //     .attr("fill", d => color(d))
        //     .attr('x', -5)
        //     .attr('y', -10)
        //     .attr("width", '15px')
        //     .attr('height', '15px')
        //     .attr("rx", 1.5)
        //     .attr("ry", 1.5)
        
        //     let legend_nodes=legends.nodes();
        //     let before = legend_nodes[0];
        //     let current;
        //     let offset = 10;
    
        // for(let i = 1; i< legend_nodes.length; i++){
        // current = legend_nodes[i];
        // // if(d3.select(before).select("text").node().getComputedTextLength()){
        // //     offset += d3.select(before).select("text").node().getComputedTextLength();
        // // }else{
        // //     offset += getWidth(colorSet[i-1])
        // // } 
        // d3.select(current)
        //         .attr('transform', `translate(${i*30 + offset}, 0)`);
        // before = current;
        // }
        // if(legend.node().getBBox().width){
        // // legend.attr("transform", `translate(${(chartWidth - legend.node().getBBox().width)/2}, ${chartHeight + 60})`);
        // legend.attr("transform", `translate(${(chartWidth - legend.node().getBBox().width)/2 -10}, ${chartHeight + 55})`);
        // }else{
        // offset += getWidth(colorSet[colorSet.length-1]);
        // legend.attr("transform", `translate(${(chartWidth - offset - 30 * colorSet.length + 20)/2}, ${chartHeight + 60})`);
        // }

    return svg;   

}

export default draw;