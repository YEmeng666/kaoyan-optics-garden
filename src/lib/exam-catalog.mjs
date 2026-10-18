import guides from '../../content/exam-type-guides.mjs';
import index from '../../content/exam-type-index.json';
import data from '../../content/questions.json';
import {knowledge} from './data.mjs';
import {buildExamTypes} from './exam-types.mjs';
export const examTopics=buildExamTypes(guides,index,data.questions,knowledge);
export const examGroups=examTopics.flatMap(t=>t.groups);
