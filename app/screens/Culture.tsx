import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  ReduceMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { loadCulture } from '../content/loadCulture';
import type { CultureDeck } from '../content/types';
import { useLanguage } from '../stores/useLanguage';
import AnimatedButton from '../components/AnimatedButton';

type Step =
  | 'intro1'
  | 'intro2'
  | 'intro3'
  | 'image'
  | 'quiz'
  | 'region1'
  | 'region2'
  | 'regionImage'
  | 'regionFest'
  | 'regionQuiz'
  | 'festivalsC1'
  | 'festivalsCImage'
  | 'festivalsC2'
  | 'festivalsCQuiz'
  | 'dachang1'
  | 'dachang2'
  | 'dachangImage'
  | 'dachangQuiz'
  | 'officialsB1'
  | 'officialsBImage'
  | 'officialsB2'
  | 'officialsB3'
  | 'officialsBImage2'
  | 'officialsBQuiz'
  | 'fullmoonC1'
  | 'fullmoonImage1'
  | 'fullmoonC2'
  | 'fullmoonImage2'
  | 'fullmoonC3'
  | 'fullmoonImage3'
  | 'fullmoonC4'
  | 'fullmoonCQuiz'
  | 'mainDRitual'
  | 'done';

interface QuizOption {
  text: string;
  correct: boolean;
}

const Culture: React.FC = () => {
  const { selectedLanguage } = useLanguage();
  const decks: CultureDeck[] = loadCulture(selectedLanguage);
  const [activeDeck, setActiveDeck] = useState<'1' | '2'>('1');
  const [step, setStep] = useState<Step>('intro1');
  const fade = useSharedValue(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const [showResultMulti, setShowResultMulti] = useState(false);

  const quizOptions: QuizOption[] = useMemo(
    () => [
      { text: 'fortress', correct: false },
      { text: 'new york', correct: false },
      { text: 'new castle', correct: true },
      { text: 'summer town', correct: false },
    ],
    []
  );

  const deck1Steps: Step[] = [
    'intro1', 'intro2', 'intro3', 'image', 'quiz',
    'region1', 'region2', 'regionImage', 'regionFest', 'regionQuiz',
    'festivalsC1', 'festivalsCImage', 'festivalsC2', 'festivalsCQuiz',
  ];
  const deck2Steps: Step[] = [
    'dachang1', 'dachang2', 'dachangImage', 'dachangQuiz',
    'officialsB1', 'officialsBImage', 'officialsB2', 'officialsB3', 'officialsBImage2', 'officialsBQuiz',
    'fullmoonC1', 'fullmoonImage1', 'fullmoonC2', 'fullmoonImage2', 'fullmoonC3', 'fullmoonImage3', 'fullmoonC4', 'fullmoonCQuiz',
    'mainDRitual'
  ];
  const stepsOrder: Step[] = [...deck1Steps, ...deck2Steps];
  const go = (next: Step) => {
    fade.value = withSequence(
      withTiming(0, { duration: 150, reduceMotion: ReduceMotion.System }),
      withTiming(1, { duration: 150, reduceMotion: ReduceMotion.System }, () => {
        runOnJS(setStep)(next);
      })
    );
  };

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
  }));

  // Reset quiz state when entering any quiz step to avoid pre-revealing answers
  React.useEffect(() => {
    const singleQuizzes: Step[] = ['quiz', 'festivalsCQuiz', 'dachangQuiz', 'officialsBQuiz', 'fullmoonCQuiz'];
    if (singleQuizzes.includes(step)) {
      setShowResult(false);
      setSelected(null);
    }
    if (step === 'regionQuiz') {
      setShowResultMulti(false);
      setMultiSelected(new Set());
    }
  }, [step]);

  if (selectedLanguage !== 'dz') {
    return (
      <View style={styles.container}> 
        <Text style={styles.title}>Culture</Text>
        <Text style={styles.meta}>This section is currently available for Dzardzongke only. Quechua coming soon.</Text>
      </View>
    );
  }

  // Image sources are now loaded from JSON content files
  const placeholderImage = require('../../assets/images/react-logo.png');

  const subtitle = useMemo(() => {
    if (step === 'intro1' || step === 'intro2' || step === 'intro3' || step === 'image' || step === 'quiz') {
      return 'Part a — Introduction to the Dzardzongke language';
    }
    if (step === 'region1' || step === 'region2' || step === 'regionImage' || step === 'regionFest' || step === 'regionQuiz') {
      return 'Part b — About the Dzardzongke region';
    }
    if (step === 'festivalsC1' || step === 'festivalsCImage' || step === 'festivalsC2' || step === 'festivalsCQuiz') {
      return 'Part c — Dzardzongke festivals';
    }
    if (step === 'dachang1' || step === 'dachang2' || step === 'dachangImage' || step === 'dachangQuiz') {
      return 'Part a — Dachang preparations';
    }
    if (step === 'officialsB1' || step === 'officialsBImage' || step === 'officialsB2' || step === 'officialsB3' || step === 'officialsBImage2' || step === 'officialsBQuiz') {
      return 'Part b — Introducing the village officials and the Lhabon ‘village priest’';
    }
    if (step === 'fullmoonC1' || step === 'fullmoonImage1' || step === 'fullmoonC2' || step === 'fullmoonImage2' || step === 'fullmoonC3' || step === 'fullmoonImage3' || step === 'fullmoonC4' || step === 'fullmoonCQuiz') {
      return 'Part c — Dachang activities on the day of the full moon';
    }
    if (step === 'mainDRitual') {
      return 'Part d — The main Dachang ritual';
    }
    return 'Culture';
  }, [step]);

  const titleText = useMemo(() => (activeDeck === '1' ? decks[0]?.title ?? '1' : decks[1]?.title ?? '2'), [activeDeck]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{titleText}</Text>
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeDeck === '1' ? styles.segmentActive : undefined]}
          onPress={() => {
            setActiveDeck('1');
            if (!deck1Steps.includes(step)) setStep(deck1Steps[0]);
          }}
        >
          <Text style={[styles.segmentText, activeDeck === '1' ? styles.segmentTextActive : undefined]}>Language & Region</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeDeck === '2' ? styles.segmentActive : undefined]}
          onPress={() => {
            setActiveDeck('2');
            if (!deck2Steps.includes(step)) setStep(deck2Steps[0]);
          }}
        >
          <Text style={[styles.segmentText, activeDeck === '2' ? styles.segmentTextActive : undefined]}>Dachang festival</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {(() => {
        const currentDeck = activeDeck === '1' ? deck1Steps : deck2Steps;
        const idx = currentDeck.indexOf(step);
        const total = currentDeck.length;
        if (idx === -1) return null;
        return <Text style={styles.progressText}>Step {idx + 1} of {total}</Text>;
      })()}

      <Animated.View style={fadeStyle}>
        {step === 'intro1' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              Mustang is one of 77 districts in Nepal, and the most sparsely populated. Like many districts or parts of
              districts, it was once an autonomous kingdom that was integrated into Nepal during the unification of the
              country by the Gorkhas in the late 18th century. The Tibetan name for the kingdom founded in the 14th c. is
              Lo. The district headquarters of Mustang is Jomsom or Dzongsam in the local language called ‘Dzardzongke’.
              Sam is the Dzardzongke word for “new” and dzong means ‘castle’ so the name of the town of Jomsom means
              “Newcastle”.
            </Text>
          </View>
        )}

        {step === 'officialsB1' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              All villages have a number of officials whose term of office runs for a full year. The most important of these are the genpa “headmen” who are appointed during the Dachang festival.
            </Text>
          </View>
        )}

        {step === 'officialsBImage' && (
          <View style={styles.card}>
            <Image source={placeholderImage} style={styles.photo} resizeMode="contain" onError={() => setImageError(true)} />
            <Text style={styles.caption}>New Khyenga village officials selected during the Dachang festival - April 2025 </Text>
          </View>
        )}

        {step === 'officialsB2' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              The only lifelong office in the village is that of the village priest, the Lhabon, locally pronounced lhayen, whose main duties are to propitiate local divinities. In the past, almost all villages had a Lhabon, whose main duties were to propitiate local divinities, but now there is only one left in the village of Khyenga. In this village, Lhabon Ngodrup had held the office from the age of fifty until his death in 2002 at the age of eighty-four.
            </Text>
            <Text style={styles.p}>
              In the meantime, he had trained another young Lhabon, also named Ngodrup, who duly replaced him. But Ngodrup the younger died prematurely after five years, without having had an opportunity to train a successor. In response to entreaties from the village and also from Lama Tshultrim of Lubrak, who has numerous patrons in Khyenga and is greatly respected, Takla agreed to assume the position.
            </Text>
          </View>
        )}

        {step === 'officialsB3' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              This ancient tradition was therefore at risk of being lost forever, but fortunately, professor Charles Ramble (locally known as Yungdrung Tshewang) had complete video documentation of Lhabon Ngodrup the elder’s performance from 1995. The new Lhabon Takla, who speaks Dzardzongke and Standard Tibetan but is literate only in Nepali, transcribed the narration phonetically and memorised the whole thing in 2007. He has been the Lhabön of Khyenga ever since.
            </Text>
          </View>
        )}

        {step === 'officialsBImage2' && (
          <View style={styles.card}>
            <Image source={placeholderImage} style={styles.photo} resizeMode="contain" onError={() => setImageError(true)} />
            <Text style={styles.caption}>Lhabon Takla propitiating local gods on top of the Khyenga temple - April 2025</Text>
          </View>
        )}

        {step === 'officialsBQuiz' && (
          <View style={styles.card}>
            <Text style={styles.quizTitle}>Quiz</Text>
            <Text style={styles.quizQ}>Which village in the Dzardzongke area still has a village priest?</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {[
                { text: 'Kagbeni', correct: false },
                { text: 'Khyenga', correct: true },
                { text: 'Dzar', correct: false },
                { text: 'Dzong', correct: false },
              ].map(opt => {
                const isSelected = selected === opt.text;
                const isCorrect = showResult && opt.correct;
                const isWrong = showResult && isSelected && !opt.correct;
                return (
                  <AnimatedButton
                    key={opt.text}
                    style={[styles.choice, isCorrect ? styles.correct : isWrong ? styles.wrong : undefined]}
                    onPress={() => {
                      if (showResult) return;
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelected(opt.text);
                      setShowResult(true);
                    }}
                    hapticFeedback="light"
                  >
                    <Text style={styles.choiceText}>{opt.text}</Text>
                  </AnimatedButton>
                );
              })}
            </View>
          </View>
        )}

        {step === 'fullmoonC1' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              At 9.30 in the morning of the day of the full moon, Lhabon Takla walks over to the house of one of the village constables to have simple breakfast with a cup of arak. After breakfast, his constables help him to put on his fine clothes of silk and a turban of white cotton. He then performs a small purification ritual on the roof of the stable: he lights a fire of juniper branches, blows out the flames, and fans the smoke into his own face with his hand. 
            </Text>
          </View>
        )}

        {step === 'fullmoonImage1' && (
          <View style={styles.card}>
            <Image source={placeholderImage} style={styles.photo} resizeMode="contain" onError={() => setImageError(true)} />
            <Text style={styles.caption}>Lhabon Takla prostrates in the temple - April 2025</Text>
          </View>
        )}

        {step === 'fullmoonC2' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              Accompanied by two of the constables, he then walks to the temple, prostrates three times to the altar – which features images of Guru Rinpoche and his two wives, flanked by two of his wrathful forms to his right and left. He lights a bundle of incense sticks and placed it on the altar, before backing out of the temple and climbing on his white horse. The constables then lead the horse and the Lhabon up the hill towards Muktinath. Along the southern wall of the courtyard of the temple are six big prayer flags. Five of them are in colours corresponding to the five elements. The sixth flag is white and with no xylographic prints. This is the flag of the Lhabön himself.
            </Text>
          </View>
        )}

        {step === 'fullmoonImage2' && (
          <View style={styles.card}>
            <Image source={placeholderImage} style={styles.photo} resizeMode="contain" onError={() => setImageError(true)} />
            <Text style={styles.caption}>Village men replace the prayer flags at the new stupa - April 2025</Text>
          </View>
        )}

        {step === 'fullmoonC3' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              Finally, two of the other constables are chosen to consecrate the village shrines. This last group starts at the site at which Lhabon Takla later performs the propitiation ritual, the cluster of stupas jammed between a pair of huge Himalayan poplars. The site is called Jowo Dongpo, the “Lord’s trees”. One of the constables splashes red clay on the appropriate part of the main trees and the shrine, and also on the trees within the shrine enclosure, and the other administers whitewash. As they do so, one of them, loudly recites:
            </Text>
            <Text style={styles.p}>
              lha darro, Khyenga Yulsa Suna Yeshe darro, mewa daro, parkha darro!
            </Text>
            <Text style={styles.p}>
              “May the gods flourish, may the territorial god of Khyenga, Suna Yeshe, flourish, may the “magic squares” flourish, may the trigrams flourish!”
            </Text>
            <Text style={styles.p}>
              When they finish their work here, each takes a bucket of red clay and goes to a different location. One to a nearby site to the north of the trees called Khalung, and the other to a stupa located on the steep hill to the south of the village. The latter is the site of a local god called Pholha Debka or Pholha Demba.
            </Text>
          </View>
        )}

        {step === 'fullmoonImage3' && (
          <View style={styles.card}>
            <Image source={placeholderImage} style={styles.photo} resizeMode="contain" onError={() => setImageError(true)} />
            <Text style={styles.caption}>Lhabon Takla meets one of the women who give him arak - April 2025</Text>
          </View>
        )}

        {step === 'fullmoonC4' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              Lhabon Takla meanwhile goes up to Muktinath, where he showers under each of the 108 spouts of the sacred temple. The usual procedure is that the women of the village, wearing their beautiful clothes, follow him up and collect branches from all the different varieties of trees growing around Muktinath. They meet him while he is on his way down and honour him with beer and arak. The women are called zhulema, “women with zhules”.
            </Text>
          </View>
        )}

        {step === 'fullmoonCQuiz' && (
          <View style={styles.card}>
            <Text style={styles.quizTitle}>Quiz</Text>
            <Text style={styles.quizQ}>Where does the Lhabon go on the first day of Dachang?</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {[
                { text: 'To consecrate the Jowo Dongpo, the “Lord’s trees”', correct: false },
                { text: 'To the stupa to put up new prayer flags', correct: false },
                { text: 'To Muktinath to shower', correct: true },
              ].map(opt => {
                const isSelected = selected === opt.text;
                const isCorrect = showResult && opt.correct;
                const isWrong = showResult && isSelected && !opt.correct;
                return (
                  <AnimatedButton
                    key={opt.text}
                    style={[styles.choice, isCorrect ? styles.correct : isWrong ? styles.wrong : undefined]}
                    onPress={() => {
                      if (showResult) return;
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelected(opt.text);
                      setShowResult(true);
                    }}
                    hapticFeedback="light"
                  >
                    <Text style={styles.choiceText}>{opt.text}</Text>
                  </AnimatedButton>
                );
              })}
            </View>
          </View>
        )}

        {step === 'mainDRitual' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              The two main constables help the Lhabon with the main Dachang ritual at the sacred tree on the Jowo Dongpo site. In this video you can see how they make the tormas (on the right) and the goat (on the left). Later in the ritual the Lhabon ceremonially stabs the clay goat.
            </Text>
          </View>
        )}

        {step === 'festivalsC1' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              Traditional festivals in the Dzardzongke valley and its surroundings are at specific times in the year. Although Buddhism and Hinduism are found throughout the area, these festivals originally represented older, so-called “pagan” traditions. In recent times, they have become more mixed with other religious traditions. There are three main “pagan” calendrical ceremonies in the Baragaon area, expressed in the following maxim: pi dachang, yar yartung, gun tshongguk “In the spring there is the Dachang; in summer the Yartung, and in winter the Tshongguk.”
            </Text>
            <Text style={styles.p}>
              Tshongguk literally means “Bringing home the [profits from] trade”. This is the local name for the New Year ceremony according to the agrarian calendar that precedes the main official Tibeto-Mongol calendar by a month. This is the calendar that is observed in most of the villages. It refers to the rule whereby everyone who goes to India for seasonal trade after the buckwheat harvest in October should return to their respective communities by this date. If they didn’t return on time, they had to pay a fine, because it was important to bring bag the trade earnings to the village.
            </Text>
          </View>
        )}

        {step === 'festivalsCImage' && (
          <View style={styles.card}>
            <Image source={placeholderImage} style={styles.photo} resizeMode="contain" onError={() => setImageError(true)} />
            <Text style={styles.caption}>Poster to advertise the annual Yarthung horse riding competition in August 2022</Text>
          </View>
        )}

        {step === 'festivalsC2' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              The festivals are, in principle, spaced at four-month intervals. The Yartung “Summer festival,” is an occasion featuring all sorts of sports, especially horsemanship. The Dachang “Arrow-Beer” focusses specifically on archery. All three ceremonies are embedded in a week of feasting, propitiation of local gods, dancing and songs.
            </Text>
          </View>
        )}

        {step === 'festivalsCQuiz' && (
          <View style={styles.card}>
            <Text style={styles.quizTitle}>Quiz</Text>
            <Text style={styles.quizQ}>When is the annual horse riding competition?</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {[
                { text: 'During Tshongguk in Winter', correct: false },
                { text: 'During Dachang in Spring', correct: false },
                { text: 'During Yarthung in Summer', correct: true },
              ].map(opt => {
                const isSelected = selected === opt.text;
                const isCorrect = showResult && opt.correct;
                const isWrong = showResult && isSelected && !opt.correct;
                return (
                  <AnimatedButton
                    key={opt.text}
                    style={[styles.choice, isCorrect ? styles.correct : isWrong ? styles.wrong : undefined]}
                    onPress={() => {
                      if (showResult) return;
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelected(opt.text);
                      setShowResult(true);
                    }}
                    hapticFeedback="light"
                  >
                    <Text style={styles.choiceText}>{opt.text}</Text>
                  </AnimatedButton>
                );
              })}
            </View>
          </View>
        )}

        {step === 'intro2' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              Dzardzongke is a variety of Tibetan spoken in the majority of villages of Baragaon, in South Mustang. The
              name of the language is derived from the local name for the Muktinath Valley, Dzardzong Yuldruk, which means
              the “Six Villages including Dzar and Dzong.” Dzardzongke is similar to other Tibetic languages, especially
              those spoken nearby like Loke in Upper Mustang. But it also has unique words and grammatical features that are
              not found in any other variety, not even, for example, in Loke or other Tibetic languages spoken in Nepal or
              in the more widely used varieties like Standard or Lhasa Tibetan.
            </Text>
          </View>
        )}

        {step === 'intro3' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              Dzardzongke is an endangered language, which means that it is at high risk of being lost forever. It is
              currently still spoken by around 1800 speakers. Some of these live in the Muktinath Valley, but many have moved
              to bigger cities like Kathmandu, Hong Kong, Paris or New York. Together with Dzardzongke speakers, we have
              developed this app to help preserve the Dzardzongke language and the cultural heritage of its speakers. With
              the app, you can learn about local history and festivals like the dachang ‘arrow-beer’ or the yarthung ‘summer’
              festival. You can also use the app to learn to speak the language, or, if you already speak it, you can learn
              how to write it.
            </Text>
          </View>
        )}

        {step === 'image' && (
          <View style={styles.card}>
            {imageError ? (
              <View style={[styles.photo, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }]}> 
                <Text style={{ color: '#64748b', textAlign: 'center' }}>
                  Missing image file at
                  {'\n'}
                  assets/images/Culture/culture1.png
                </Text>
              </View>
            ) : (
              <Image source={IMG_SOURCE} style={styles.photo} resizeMode="contain" onError={() => setImageError(true)} />
            )}
            <Text style={styles.caption}>Part of the Muktinath Valley with Dzar on the left and Dzong on the right — August 2022</Text>
          </View>
        )}

        {step === 'quiz' && (
          <View style={styles.card}>
            <Text style={styles.quizTitle}>Quiz</Text>
            <Text style={styles.quizQ}>What does the name of the town Jomsom mean?</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {quizOptions.map(opt => {
                const isSelected = selected === opt.text;
                const isCorrect = showResult && opt.correct;
                const isWrong = showResult && isSelected && !opt.correct;
                return (
                  <AnimatedButton
                    key={opt.text}
                    style={[styles.choice, isCorrect ? styles.correct : isWrong ? styles.wrong : undefined]}
                    onPress={() => {
                      if (showResult) return;
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelected(opt.text);
                      setShowResult(true);
                    }}
                    hapticFeedback="light"
                  >
                    <Text style={styles.choiceText}>{opt.text}</Text>
                  </AnimatedButton>
                );
              })}
            </View>
          </View>
        )}

        {step === 'region1' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              A short distance north of Jomsom is the Pandak river, an eastern tributary of the Kali Gandaki. This river is an old territorial boundary. To the south of it is the territory of the former kingdom of Thini (also known as Sompo). The area to the north of it was controlled by a settlement called Tshotsholung or “Old Kagbeni”. Old Kagbeni was submerged by a massive landslide at some unknown period and moved to its present location, a short distance to the north as the entrance of the Muktinath Valley.
            </Text>
          </View>
        )}

        {step === 'region2' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              All this territory, up to the present-day Tibetan border, both north and south of the Pandak River, was conquered by the founder of the kingdom of Lo, Amepal (a mes dpal) in the 14th century. The Pandak River is also a cultural dividing line: villages to the south of it speak Thakali, a Tamangic language in the Tibeto-Burman family. Communities to the north of it speak different varieties of Tibetan or Seke, which is more like Thakali. Currently, Dzardzongke is spoken in the villages of Lubrak, Kagbeni, Khyenga, Chongkor, Dzar, Dzong and Chusang.
            </Text>
          </View>
        )}

        {step === 'regionImage' && (
          <View style={styles.card}>
            <Image source={placeholderImage} style={styles.photo} resizeMode="contain" onError={() => setImageError(true)} />
            <Text style={styles.caption}>The northern part of the village of Chusang - August 2022</Text>
          </View>
        )}

        {step === 'regionFest' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              In some of the villages in the Dzardzongke Valley and beyond, they still celebrate festivals like the Dachang and the Yarthung. Traditionally, the main ceremony was the Demdem Chöpa, which featured dancing, singing, archery and the propitiation of local territorial gods. It is not known when the ceremony used to be celebrated, but the Dachang ceremonies that are held in each of the villages may be the local survivals of this once inter-communal event between multiple villages. In the next lesson, you will learn more about the Dachang and other festivals.
            </Text>
          </View>
        )}

        {step === 'regionQuiz' && (
          <View style={styles.card}>
            <Text style={styles.quizTitle}>Quiz</Text>
            <Text style={styles.quizQ}>What did they do during the ancient Demdem Chöpa ceremony?</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {[
                { text: 'dancing', correct: true },
                { text: 'singing', correct: true },
                { text: 'worship the buddha', correct: false },
                { text: 'archery', correct: true },
              ].map(opt => {
                const isSelected = multiSelected.has(opt.text);
                const isCorrect = showResultMulti && opt.correct;
                const isWrong = showResultMulti && isSelected && !opt.correct;
                return (
                  <AnimatedButton
                    key={opt.text}
                    style={[styles.choice, isSelected ? { borderColor: '#2563eb' } : undefined, isCorrect ? styles.correct : isWrong ? styles.wrong : undefined]}
                    onPress={() => {
                      if (showResultMulti) return;
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      const next = new Set(multiSelected);
                      if (next.has(opt.text)) next.delete(opt.text); else next.add(opt.text);
                      setMultiSelected(next);
                    }}
                    hapticFeedback="light"
                  >
                    <Text style={styles.choiceText}>{opt.text}</Text>
                  </AnimatedButton>
                );
              })}
            </View>
          </View>
        )}

        {step === 'dachang1' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              Dachang “arrow beer,” is traditionally celebrated in the fourth month of the year. The local calendars of each of the villages do not coincide, however, so this means that the events are staggered over three months, one village at the time. Moreover, even villages that celebrate the Dachang in the same month do not do so on the same dates. The Dachang of Dzar, for example, finishes on the 13th day of the month, the day before the Khyenga Dachang begins. This is usually in March, April or May (10 April in 2025).
            </Text>
          </View>
        )}

        {step === 'dachang2' && (
          <View style={styles.card}>
            <Text style={styles.p}>
              Before the festival starts the village needs to make the necessary preparations. First, the village community buys a yak, which will feed the village for a week during the festivities. Early morning a small herd of seven or eight yaks is brought down to the village. The Khyenga community only need one, but it is impossible to bring a single animal down from the pasturelands - they won’t leave their companions.
            </Text>
          </View>
        )}

        {step === 'dachangImage' && (
          <View style={styles.card}>
            <Image source={placeholderImage} style={styles.photo} resizeMode="contain" onError={() => setImageError(true)} />
            <Text style={styles.caption}>Yaks to be brought down for the festival - April 2024</Text>
          </View>
        )}

        {step === 'dachangQuiz' && (
          <View style={styles.card}>
            <Text style={styles.quizTitle}>Quiz</Text>
            <Text style={styles.quizQ}>Are the Dachang festivals celebrated at the same time in all villages?</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {[
                { text: 'YES', correct: false },
                { text: 'NO', correct: true },
              ].map(opt => {
                const isSelected = selected === opt.text;
                const isCorrect = showResult && opt.correct;
                const isWrong = showResult && isSelected && !opt.correct;
                return (
                  <AnimatedButton
                    key={opt.text}
                    style={[styles.choice, isCorrect ? styles.correct : isWrong ? styles.wrong : undefined]}
                    onPress={() => {
                      if (showResult) return;
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelected(opt.text);
                      setShowResult(true);
                    }}
                    hapticFeedback="light"
                  >
                    <Text style={styles.choiceText}>{opt.text}</Text>
                  </AnimatedButton>
                );
              })}
            </View>
          </View>
        )}
      </Animated.View>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, (activeDeck === '1' ? deck1Steps.indexOf(step) <= 0 : deck2Steps.indexOf(step) <= 0) ? styles.disabled : undefined]}
          disabled={activeDeck === '1' ? deck1Steps.indexOf(step) <= 0 : deck2Steps.indexOf(step) <= 0}
          onPress={() => {
            const currentDeck = activeDeck === '1' ? deck1Steps : deck2Steps;
            const idx = currentDeck.indexOf(step);
            const prev = idx > 0 ? currentDeck[idx - 1] : currentDeck[0];
            go(prev);
          }}
        >
          <MaterialCommunityIcons name="chevron-left" size={18} color={(activeDeck === '1' ? deck1Steps.indexOf(step) <= 0 : deck2Steps.indexOf(step) <= 0) ? '#9ca3af' : '#0f172a'} />
          <Text style={[styles.navText, (activeDeck === '1' ? deck1Steps.indexOf(step) <= 0 : deck2Steps.indexOf(step) <= 0) ? styles.disabledText : undefined]}>Back</Text>
        </TouchableOpacity>
        {step !== 'done' && (
          <TouchableOpacity
            style={[styles.navBtn, styles.primary]}
            onPress={() => {
              if (step === 'regionQuiz' && !showResultMulti) {
                setShowResultMulti(true);
                return;
              }
              if (['quiz','festivalsCQuiz','dachangQuiz','officialsBQuiz','fullmoonCQuiz'].includes(step)) {
                if (!showResult) { setShowResult(true); return; }
              }
              const currentDeck = activeDeck === '1' ? deck1Steps : deck2Steps;
              const idx = currentDeck.indexOf(step);
              const next = idx < currentDeck.length - 1 ? currentDeck[idx + 1] : (activeDeck === '1' ? deck2Steps[0] : 'done');
              go(next as Step);
            }}
          >
            <Text style={[styles.navText, { color: 'white' }]}>
              {step === 'regionQuiz' && !showResultMulti ? 'Check answers' : (['quiz','festivalsCQuiz','dachangQuiz','officialsBQuiz','fullmoonCQuiz'] as Step[]).includes(step) && !showResult ? 'Check answer' : 'Next'}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={'white'} />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f7f7fb' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#475569', marginBottom: 10 },
  meta: { fontSize: 14, color: '#64748b' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  p: { color: '#1f2937', lineHeight: 22, marginBottom: 8 },
  photo: { width: '100%', borderRadius: 14, backgroundColor: '#f8fafc' },
  caption: { marginTop: 10, color: '#475569', fontStyle: 'italic' },
  quizTitle: { fontWeight: '700', marginBottom: 4 },
  quizQ: { color: '#374151' },
  choice: { backgroundColor: 'white', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  choiceText: { color: '#111827' },
  correct: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  wrong: { backgroundColor: '#FDECEC', borderColor: '#FF3B30' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white' },
  navText: { fontWeight: '600', color: '#0f172a' },
  disabled: { opacity: 0.5 },
  disabledText: { color: '#9ca3af' },
  primary: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  segmentRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white', alignItems: 'center' },
  segmentActive: { backgroundColor: '#eef2ff', borderColor: '#6366f1' },
  segmentText: { color: '#0f172a', fontWeight: '600' },
  segmentTextActive: { color: '#3730a3' },
  progressText: { color: '#64748b', marginBottom: 8 },
});

export default Culture;


