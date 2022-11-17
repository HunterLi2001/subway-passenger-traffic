import * as d3 from "d3";
import {useEffect, useRef, useState} from "react";
import {width, height, padding} from "../utils/constant";
import dataProcess from "../utils/dataProcess";
import "./svg.css";

function Svg() {
    const [metroData, setMetroData] = useState([]);
    const [once, setOnce] = useState(true);
    const svg_ = useRef(null);
    const xScale = useRef(null);
    const yScale = useRef(null);
    const linePath = useRef(null);
    const colors = useRef(null);

    /**
     * 对csv中的数据进行处理
     */
    const readData = () => {
        return d3.csv("Metro.csv", (data) => {
            let tempData = metroData;
            tempData.push(dataProcess(data));
            setMetroData(tempData);
        });
    };

    /**
     * 构造
     */
    const construction = () => {
        let trafficMax = 0;
        for (let i = 0; i < metroData.length; i++) {
            const currentMax = d3.max(metroData[i].traffic, (d) => {
                return d[1];
            });
            if (currentMax > trafficMax) trafficMax = currentMax;
        }
        svg_.current = d3.select("svg")
            .attr("width", `${width}`)
            .attr("height", `${height}`);
        xScale.current = d3.scaleLinear()
            .domain([1, 32])
            .range([0, width - padding.left - padding.right - 100]);
        yScale.current = d3.scaleLinear()
            .domain([0, trafficMax * 1.1])
            .range([height - padding.top - padding.bottom, 0]);
        linePath.current = d3.line()
            .x((d) => {
                return xScale.current(d[0]);
            })
            .y((d) => {
                return yScale.current(d[1]);
            });
        colors.current = [
            d3.rgb(255, 0, 0),
            d3.rgb(0, 255, 0),
            d3.rgb(0, 0, 255),
            d3.rgb(255, 255, 0),
            d3.rgb(0, 255, 255)
        ];
    };

    /**
     * 绘制统计图
     */
    const drawPicture = () => {
        const svg = svg_.current;
        svg.selectAll("path")
            .data(metroData)
            .enter()
            .append("path")
            .attr("transform", `translate(${padding.left},${padding.top})`)
            .attr("d", (d) => {
                return linePath.current(d.traffic);
            })
            .attr("fill", "none")
            .attr("stroke-width", 3)
            .attr("stroke", (d, i) => {
                return colors.current[i];
            });

        const xAxis = d3.axisBottom(xScale.current)
            .ticks(5);

        const yAxis = d3.axisLeft(yScale.current);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${padding.left},${height - padding.bottom})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${padding.left},${padding.top})`)
            .call(yAxis);
    };

    /**
     * 绘制图例
     */
    const drawLegend = () => {
        const svg = svg_.current;
        const gMark = svg.selectAll(".gMark")
            .data(metroData)
            .enter()
            .append("g")
            .attr("transform", (d, i) => {
                return `translate(${width - padding.right - 50},${padding.top + 130 + i * 30})`;
                // return `translate(${padding.left + i * 80},${height - padding.bottom + 40})`;
            });
        gMark.append("rect");

        gMark.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", (d, i) => {
                return colors.current[i];
            });

        gMark.append("text")
            .attr("dx", 15)
            .attr("dy", "0.5em")
            .attr("fill", "black")
            .text(d => d.city);
    };

    /**
     * 由于useEffect做不到异步，则单独领出来进行执行。
     * readData是异步的，需要等待获取到metroData后才能执行后续操作
     * @returns {Promise<void>}
     */
    const operation = async () => {
        await readData();
        construction();
        drawPicture();
        drawLegend();
    };

    useEffect(() => {
        if (once) {
            operation();
        }
        setOnce(false);
        return () => {
            setMetroData([]);
        };
    }, []);

    return (
        <div className="App">
            <svg></svg>
        </div>
    );
}

export default Svg;
