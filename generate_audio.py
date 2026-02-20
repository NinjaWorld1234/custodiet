from gtts import gTTS
import os

# Narration text in Arabic
text = """أهلاً بكم في نظام كوستوديت (Custodiet)، منصة الاستخبارات الأمنية المتقدمة.
يوفر النظام رؤية شاملة للمخاطر والتهديدات في الوقت الفعلي عبر واجهة تفاعلية حديثة.
من خلال لوحة القيادة، يمكنكم مراقبة الحالة التشغيلية، والتهديدات النشطة، وأحمال الشبكة بدقة متناهية.
تتيح الخريطة الحية تتبع الأحداث العالمية لحظة بلحظة، مع تصنيف دقيق للحوادث مثل النزاعات، والكوارث الطبيعية، والأمن السيبراني.
ويضمن سجل الأحداث بقاءكم على اطلاع دائم بآخر التنبيهات مع مستويات خطورة واضحة ومؤشرات موثوقية المصادر.
كوستوديت.. رؤية أمنية ثاقبة لمستقبل أكثر أماناً."""

output_file = "d:\\Naser-Programs\\Zaki\\custodiet\\custodiet_narration_ar.mp3"

print(f"Generating audio for text:\n{text}")

try:
    tts = gTTS(text=text, lang='ar', slow=False)
    tts.save(output_file)
    print(f"Successfully saved audio to {output_file}")
except Exception as e:
    print(f"Error generating audio: {e}")
