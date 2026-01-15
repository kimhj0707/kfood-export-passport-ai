
import { AnalysisReport } from '../types';

export const MOCK_REPORTS: AnalysisReport[] = [
  {
    id: 'KF-20240520-0742',
    createdAt: '2024-05-20 18:45',
    country: 'US',
    ocrEngine: 'google',
    ocrText: `[제품명] 고추장 불고기 맛 김부각\n[원재료명] 김(국산) 40%, 찹쌀(국산) 30%, 옥수수유 20%, 고추장시즈닝 10% [고추장분말, 설탕, 정제소금, L-글루탐산나트륨, 대두, 밀 함유]\n[영양성분] 총 내용량 50g (255 kcal), 나트륨 320mg (16%), 탄수화물 28g (9%), 당류 4g (4%), 지방 15g (28%), 트랜스지방 0g, 포화지방 2.5g (17%), 콜레스테롤 0mg (0%), 단백질 2g (4%)\n[유통기한] 2025.12.30 까지`,
    ingredients: ['김 (Seaweed)', '찹쌀 (Glutinous Rice)', '옥수수유 (Corn Oil)', '설탕 (Sugar)', '소금 (Salt)'],
    allergens: ['대두 (Soybean)', '밀 (Wheat)'],
    nutrients: [
      { name: '열량', nameEn: 'Calories', amount: '255 kcal', percent: '-' },
      { name: '나트륨', nameEn: 'Sodium', amount: '320 mg', percent: '16%' },
      { name: '탄수화물', nameEn: 'Carbohydrate', amount: '28 g', percent: '9%' },
      { name: '당류', nameEn: 'Total Sugars', amount: '4 g', percent: '4%' },
      { name: '지방', nameEn: 'Total Fat', amount: '15 g', percent: '28%' },
      { name: '단백질', nameEn: 'Protein', amount: '2 g', percent: '4%' },
    ],
    regulations: [
      {
        type: 'warning',
        title: '영양성분 표시 양식 (Nutrition Facts Label)',
        description: '2016년 개정된 FDA의 New Nutrition Facts Label 포맷 적용이 필수적입니다. Added Sugars 표시가 누락되어 있습니다.'
      },
      {
        type: 'warning',
        title: '알레르겐 강조 표시 (FALCPA Compliance)',
        description: '"Contains: Soy, Wheat" 문구를 성분 리스트 바로 아래 또는 근처에 굵은 글씨로 별도 표기해야 합니다.'
      },
      {
        type: 'info',
        title: '원산지 표기 (Country of Origin)',
        description: '전면 하단 또는 후면에 "Product of Korea" 표기가 명확한 영문으로 포함되어야 합니다.'
      },
      {
        type: 'info',
        title: '중량 환산 단위',
        description: '미국 수출용의 경우 Metric unit(g)과 함께 Imperial unit(oz) 병행 표기가 권장됩니다. (Net Wt 1.76 oz (50g))'
      }
    ],
    marketing: {
      localizedDescription: 'Experience the perfect harmony of traditional Korean Gim (seaweed) and the bold, savory kick of Gochujang (Korean chili paste). Our Crunchy Seaweed Snacks are double-roasted with glutinous rice for an extra crispy texture, offering a guilt-free, high-flavor snack experience that\'s uniquely Korean.',
      snsCopy: '"Spice up your snack game! 🔥 These Gochujang Seaweed Chips are the ultimate crunchy craving. Authentically Korean, incredibly addictive. #KFood #HealthySnacking #GochujangMagic #SeaweedChips"',
      buyerPitch: '"Our product taps into the surging \'K-Flavor\' trend in the US market. By combining the health-conscious seaweed snack category with the trending Gochujang flavor profile, we offer a high-margin specialty item that appeals to Gen Z and millennial consumers seeking global flavors."'
    }
  },
  {
    id: 'KF-20240524-1432',
    createdAt: '2024-05-24 14:32',
    country: 'JP',
    ocrEngine: 'google',
    ocrText: `[製品名] 参鶏湯 (삼계탕)\n[原材料] 鶏肉(韓国産), 高麗人参, もち米, ナツメ, ニンニク, 食塩, ショウガ粉末`,
    ingredients: ['닭고기 (Chicken)', '인삼 (Ginseng)', '찹쌀 (Glutinous Rice)', '대추 (Jujube)'],
    allergens: ['닭고기 (Chicken)'],
    nutrients: [],
    regulations: [],
    marketing: {
        localizedDescription: '',
        snsCopy: '',
        buyerPitch: ''
    }
  },
  {
    id: 'KF-20240520-1845',
    createdAt: '2024-05-20 18:45',
    country: 'VN',
    ocrEngine: 'tesseract',
    ocrText: `[Tên sản phẩm] Kim chi truyền thống\n[Thành phần] Cải thảo, Bột ớt, Tỏi, Hành lá, Muối, Nước mắm`,
    ingredients: ['배추 (Cabbage)', '고춧가루 (Chili Powder)', '마늘 (Garlic)', '피시소스 (Fish Sauce)'],
    allergens: [],
    nutrients: [],
    regulations: [],
    marketing: {
        localizedDescription: '',
        snsCopy: '',
        buyerPitch: ''
    }
  }
];
