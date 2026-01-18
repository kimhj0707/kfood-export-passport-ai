import React from "react";

interface NutritionData {
  [key: string]: {
    value: string | number;
    unit: string;
  };
}

interface NutritionTableProps {
  country: string;
  nutrition: NutritionData;
}

// FDA 일일 권장량
const FDA_DAILY_VALUES: Record<string, number> = {
  "Total Fat": 78,
  "Saturated Fat": 20,
  "Cholesterol": 300,
  "Sodium": 2300,
  "Total Carbohydrate": 275,
  "Dietary Fiber": 28,
  "Protein": 50,
  "Vitamin D": 20,
  "Calcium": 1300,
  "Iron": 18,
  "Potassium": 4700,
};

// 중국 NRV
const CHINA_NRV: Record<string, number> = {
  "能量": 8400,
  "蛋白质": 60,
  "脂肪": 60,
  "碳水化合物": 300,
  "钠": 2000,
  "膳食纤维": 25,
  "钙": 800,
  "铁": 15,
};

// 영양성분 매핑
const NUTRIENT_MAPPINGS: Record<string, Record<string, string>> = {
  US: {
    "열량": "Calories",
    "칼로리": "Calories",
    "탄수화물": "Total Carbohydrate",
    "당류": "Total Sugars",
    "식이섬유": "Dietary Fiber",
    "단백질": "Protein",
    "지방": "Total Fat",
    "포화지방": "Saturated Fat",
    "트랜스지방": "Trans Fat",
    "콜레스테롤": "Cholesterol",
    "나트륨": "Sodium",
  },
  JP: {
    "열량": "熱量",
    "칼로리": "熱量",
    "단백질": "たんぱく質",
    "지방": "脂質",
    "탄수화물": "炭水化物",
    "나트륨": "食塩相当量",
    "당류": "糖類",
    "식이섬유": "食物繊維",
  },
  EU: {
    "열량": "Energy",
    "칼로리": "Energy",
    "지방": "Fat",
    "포화지방": "of which saturates",
    "탄수화물": "Carbohydrate",
    "당류": "of which sugars",
    "단백질": "Protein",
    "나트륨": "Salt",
    "식이섬유": "Fibre",
  },
  CN: {
    "열량": "能量",
    "칼로리": "能量",
    "단백질": "蛋白质",
    "지방": "脂肪",
    "탄수화물": "碳水化合物",
    "나트륨": "钠",
    "당류": "糖",
    "식이섬유": "膳食纤维",
  },
  VN: {
    "열량": "Năng lượng",
    "칼로리": "Năng lượng",
    "단백질": "Chất đạm",
    "지방": "Chất béo",
    "탄수화물": "Carbohydrate",
    "나트륨": "Natri",
    "당류": "Đường",
    "식이섬유": "Chất xơ",
  },
};

const parseValue = (val: string | number): number => {
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
};

// 미국 FDA Nutrition Facts
const USATable: React.FC<{ nutrition: NutritionData }> = ({ nutrition }) => {
  const mapping = NUTRIENT_MAPPINGS.US;
  const getData = (korName: string) => {
    const data = nutrition[korName];
    return data ? parseValue(data.value) : 0;
  };

  const calories = getData("열량") || getData("칼로리");

  const nutrients = [
    { name: "Total Fat", kor: "지방", unit: "g", bold: true },
    { name: "Saturated Fat", kor: "포화지방", unit: "g", indent: true },
    { name: "Trans Fat", kor: "트랜스지방", unit: "g", indent: true },
    { name: "Cholesterol", kor: "콜레스테롤", unit: "mg", bold: true },
    { name: "Sodium", kor: "나트륨", unit: "mg", bold: true },
    { name: "Total Carbohydrate", kor: "탄수화물", unit: "g", bold: true },
    { name: "Dietary Fiber", kor: "식이섬유", unit: "g", indent: true },
    { name: "Total Sugars", kor: "당류", unit: "g", indent: true },
    { name: "Protein", kor: "단백질", unit: "g", bold: true },
  ];

  return (
    <div className="w-full max-w-xs border-4 border-black bg-white text-black p-2 font-sans">
      <div className="text-3xl font-black border-b border-black pb-1">Nutrition Facts</div>
      <div className="text-xs py-1 border-b-8 border-black">Serving Size 1 package</div>

      <div className="flex justify-between items-end py-1 border-b-4 border-black">
        <span className="text-xl font-black">Calories</span>
        <span className="text-3xl font-black">{Math.round(calories)}</span>
      </div>

      <div className="text-right text-xs font-bold py-1 border-b border-black">% Daily Value*</div>

      {nutrients.map((n, i) => {
        const val = getData(n.kor);
        const dv = FDA_DAILY_VALUES[n.name];
        const percent = dv && val > 0 ? Math.round((val / dv) * 100) : null;

        return (
          <div key={i} className={`flex justify-between py-0.5 border-b border-black text-xs ${n.indent ? 'pl-4' : ''}`}>
            <span className={n.bold ? 'font-bold' : ''}>{n.name} {Math.round(val)}{n.unit}</span>
            {percent !== null && <span className="font-bold">{percent}%</span>}
          </div>
        );
      })}

      <div className="text-[10px] pt-2 text-gray-600">
        * The % Daily Value tells you how much a nutrient in a serving contributes to a daily diet.
      </div>
    </div>
  );
};

// 일본 栄養成分表示
const JapanTable: React.FC<{ nutrition: NutritionData }> = ({ nutrition }) => {
  const mapping = NUTRIENT_MAPPINGS.JP;

  return (
    <div className="w-full max-w-xs border border-black bg-white text-black">
      <div className="text-center font-bold py-2 border-b border-black text-sm">栄養成分表示</div>
      <div className="text-center text-xs py-1 border-b border-black text-gray-600">1食分当たり</div>

      {Object.entries(nutrition).map(([kor, data], i) => {
        const jpName = mapping[kor] || kor;
        return (
          <div key={i} className="flex justify-between px-3 py-1.5 border-b border-gray-200 text-xs">
            <span>{jpName}</span>
            <span>{data.value}{data.unit}</span>
          </div>
        );
      })}
    </div>
  );
};

// EU Nutrition Declaration
const EUTable: React.FC<{ nutrition: NutritionData }> = ({ nutrition }) => {
  const mapping = NUTRIENT_MAPPINGS.EU;

  return (
    <div className="w-full max-w-sm border border-blue-800 bg-white text-black">
      <div className="text-center font-bold py-2 border-b border-blue-800 text-sm">Nutrition Declaration</div>
      <div className="grid grid-cols-2 bg-blue-800 text-white text-xs">
        <div className="px-3 py-1.5 font-bold">per 100g</div>
        <div className="px-3 py-1.5 font-bold text-center">per serving</div>
      </div>

      {Object.entries(nutrition).map(([kor, data], i) => {
        const euName = mapping[kor] || kor;
        const isIndent = euName.startsWith("of which");
        return (
          <div key={i} className="grid grid-cols-2 border-b border-blue-100 text-xs">
            <div className={`px-3 py-1.5 ${isIndent ? 'pl-6' : ''}`}>{euName}</div>
            <div className="px-3 py-1.5 text-center">{data.value}{data.unit}</div>
          </div>
        );
      })}
    </div>
  );
};

// 중국 营养成分表
const ChinaTable: React.FC<{ nutrition: NutritionData }> = ({ nutrition }) => {
  const mapping = NUTRIENT_MAPPINGS.CN;

  return (
    <div className="w-full max-w-sm border-2 border-black bg-white text-black">
      <div className="text-center font-bold py-2 border-b-2 border-black text-base">营养成分表</div>
      <div className="grid grid-cols-3 bg-red-600 text-white text-xs font-bold">
        <div className="px-3 py-1.5">项目</div>
        <div className="px-3 py-1.5 text-center">每100g</div>
        <div className="px-3 py-1.5 text-center">NRV%</div>
      </div>

      {Object.entries(nutrition).map(([kor, data], i) => {
        const cnName = mapping[kor];
        if (!cnName) return null;

        const val = parseValue(data.value);
        const nrv = CHINA_NRV[cnName];
        const nrvPercent = nrv && val > 0 ? Math.round((val / nrv) * 100) : null;

        return (
          <div key={i} className="grid grid-cols-3 border-b border-gray-200 text-xs">
            <div className="px-3 py-1.5">{cnName}</div>
            <div className="px-3 py-1.5 text-center">{data.value}{data.unit}</div>
            <div className="px-3 py-1.5 text-center">{nrvPercent !== null ? `${nrvPercent}%` : '-'}</div>
          </div>
        );
      })}
    </div>
  );
};

// 베트남 Thông tin dinh dưỡng
const VietnamTable: React.FC<{ nutrition: NutritionData }> = ({ nutrition }) => {
  const mapping = NUTRIENT_MAPPINGS.VN;

  return (
    <div className="w-full max-w-xs border-2 border-red-600 bg-white text-black">
      <div className="text-center font-bold py-2 bg-red-600 text-white text-sm">THÔNG TIN DINH DƯỠNG</div>
      <div className="grid grid-cols-2 bg-red-100 text-xs font-bold border-b border-red-200">
        <div className="px-3 py-1.5">Thành phần</div>
        <div className="px-3 py-1.5 text-center">Hàm lượng</div>
      </div>

      {Object.entries(nutrition).map(([kor, data], i) => {
        const vnName = mapping[kor];
        if (!vnName) return null;

        return (
          <div key={i} className="grid grid-cols-2 border-b border-red-100 text-xs">
            <div className="px-3 py-1.5">{vnName}</div>
            <div className="px-3 py-1.5 text-center">{data.value}{data.unit}</div>
          </div>
        );
      })}
    </div>
  );
};

const COUNTRY_LABELS: Record<string, string> = {
  US: "미국 FDA",
  JP: "일본",
  EU: "유럽연합",
  CN: "중국 GB",
  VN: "베트남",
};

const NutritionTable: React.FC<NutritionTableProps> = ({ country, nutrition }) => {
  if (!nutrition || Object.keys(nutrition).length === 0) {
    return null;
  }

  const renderTable = () => {
    switch (country) {
      case "US":
        return <USATable nutrition={nutrition} />;
      case "JP":
        return <JapanTable nutrition={nutrition} />;
      case "EU":
        return <EUTable nutrition={nutrition} />;
      case "CN":
        return <ChinaTable nutrition={nutrition} />;
      case "VN":
        return <VietnamTable nutrition={nutrition} />;
      default:
        return null;
    }
  };

  const table = renderTable();
  if (!table) return null;

  return (
    <section className="bg-card border border-card-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-card-border flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">nutrition</span>
        <h3 className="font-semibold text-text-primary">{COUNTRY_LABELS[country]} 규격 영양성분표</h3>
      </div>
      <div className="p-5">
        <p className="text-xs text-text-muted mb-4">
          아래 표는 수출국 규격에 맞게 변환된 영양성분표입니다. 실제 라벨 제작 시 참고하세요.
        </p>
        <div className="flex justify-center">
          {table}
        </div>
      </div>
    </section>
  );
};

export default NutritionTable;
