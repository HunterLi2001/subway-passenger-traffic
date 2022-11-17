/**
 * 对从csv中拿到的数据进行处理，使其能够匹配能够绘制出折线图的样式
 * @param data
 * @returns {{city, traffic: *[]}}
 */
export default function dataProcess(data) {
    const output = {
        city: data["城市"],
        traffic: []
    };
    for (let key in data) {
        output.traffic.push([parseInt(key),parseFloat(data[key])]);
    }
    output.traffic.pop();
    return output;
}