import course from '../../content/course.json';
import patterns from '../../content/patterns.json';
import formulas from '../../content/formulas.json';
import supplement from '../../content/supplement.json';
export {course,patterns,formulas};
export const knowledge = [
 {id:'conditions',title:'叠加原理与干涉条件',section:'5.1',summary:'稳定干涉来自相关电场的叠加。先检查频率、相位稳定性与共同偏振分量。',source:'叶书 5.1，书 P157–161'},
 {id:'sources',title:'怎样获得相干光',section:'5.1',summary:'同一光源分成两路：分波面选取波面的不同部分，分振幅让同一光束分到不同路径。',source:'叶书 5.1.3，书 P161 起'},
 {id:'two-beam',title:'双光束：光程与几何',section:'5.2',summary:'双缝、等倾、等厚共享相位条件；区别在光程差如何随角度、位置或厚度变化。',source:'叶书 5.2，书 P162–170'},
 {id:'multiple',title:'多光束：从明暗到锐度',section:'5.3',summary:'多束相干叠加形成更窄的透射峰；级次、Airy 系数、精细度与分辨条件各自独立。',source:'叶书 5.3，书 P171 起'},
 {id:'films',title:'单层与多层光学薄膜',section:'5.4',summary:'单层增透同时处理相位与振幅匹配；多层高反膜需要逐层跟踪振幅和相位。',source:'叶书 5.4，书 P176 起'},
 {id:'instruments',title:'迈克耳孙与 F-P 干涉仪',section:'5.5',summary:'从装置走一遍光路：迈克耳孙擅长光程变化测量，F-P 把多光束窄峰用于光谱分析。',source:'叶书 5.5，书 P188 起'},
 {id:'coherence',title:'时间、空间与部分相干',section:'5.6',summary:'时间相干关注延迟与频谱；空间相干关注横向间隔与光源角宽；可见度是连接观测的量。',source:'叶书 5.6，书 P194 起'}
].map(k=>({...k,chapter:'5',label:'根据资料整理'})).concat(supplement);
export function href(path=''){ return `${import.meta.env.BASE_URL}${path}`.replace(/\/{2,}/g,'/'); }
