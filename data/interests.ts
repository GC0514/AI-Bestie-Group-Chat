import type { PersonaName } from '../types';

// This map links specific interests (keywords) to the personas most likely to share them.
// Keywords should be lowercase for easier matching.
export const PERSONA_INTEREST_MAP: Record<string, PersonaName[]> = {
    // Music
    '周杰伦': ['哈哈酱', '顾盼'],
    'taylor swift': ['楚菲', '林溪'],
    '摇滚': ['江晚', '星野'],
    '古典音乐': ['苏默', '顾盼'],
    'k-pop': ['元气小桃', '哈哈酱'],

    // Movies & TV
    '星际穿越': ['星野', '苏默'],
    '甄嬛传': ['顾盼', '楚菲'],
    '黑镜': ['星野', '苏默'],
    '爱情公寓': ['哈哈酱'],
    '悬疑片': ['苏默', '江晚'],
    '动漫': ['星野', '哈哈酱'],
    '漫威': ['星野', '江晚'],

    // Hobbies
    '摄影': ['江晚', '苏默'],
    '画画': ['林溪'],
    '写作': ['星野', '顾盼'],
    '健身': ['江晚', '楚菲'],
    '瑜伽': ['楚菲', '林溪'],
    '烘焙': ['元气小桃', '林溪'],
    '游戏': ['星野', '哈哈酱'],
    '旅行': ['元气小桃', '江晚'],
    '猫': ['林溪', '哈哈酱'],
    '狗': ['元气小桃'],
    
    // Food & Drink
    '咖啡': ['苏默', '楚菲'],
    '奶茶': ['元气小桃', '哈哈酱'],
    '火锅': ['元气小桃'],
    '甜品': ['元气小桃', '林溪'],
    '红酒': ['楚菲'],
    
    // Lifestyle & Fashion
    '时尚': ['楚菲'],
    '汉服': ['顾盼'],
    '化妆': ['楚菲', '元气小桃'],
    '看展': ['林溪', '楚菲'],
};
