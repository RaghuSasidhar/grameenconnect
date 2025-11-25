
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, BarChart3, BookOpen, Globe, Wifi, WifiOff, LayoutDashboard, 
  Menu, X, Leaf, Smartphone, Stethoscope, Landmark,
  Download, Trash2, Check, Search, LogOut, User as UserIcon, LogIn, Sparkles, Filter,
  ExternalLink, Loader2, PlayCircle
} from 'lucide-react';
import { DashboardCharts } from './components/DashboardCharts';
import { Button } from './components/Button';
import { ChatAssistant } from './components/ChatAssistant';
import { AuthModal } from './components/AuthModal';
import { LearningPage } from './components/LearningPage';
import { 
  Language, UserRole, ResourceCategory, ResourceItem, RegionData, DashboardStat, User 
} from './types';
import { getRecommendations, fetchWebResources } from './services/geminiService';
import { db } from './services/db';

// Translations
const TRANSLATIONS = {
  [Language.ENGLISH]: {
    landingTitle: "GrameenConnect",
    landingSubtitle: "Empowering rural communities through digital access, education, and services.",
    enterCitizen: "Enter as Citizen",
    adminDashboard: "Admin Dashboard",
    adminTitle: "Administrator Dashboard",
    adminSubtitle: "Monitoring digital literacy and engagement across villages.",
    logOut: "Log Out",
    signIn: "Sign In",
    activeUsers: "Active Users",
    resourcesDownloaded: "Resources Downloaded",
    helpRequests: "Help Requests",
    mentorsActive: "Mentors Active",
    literacyVsAdoption: "Digital Literacy vs. Service Adoption",
    userDistribution: "User Distribution by Region",
    communityFeedback: "Community Feedback & Issues",
    issueId: "Issue ID",
    village: "Village",
    category: "Category",
    status: "Status",
    citizenPortal: "Citizen Portal",
    portalSubtitle: "Access services, learn skills, and connect.",
    offlineMessage: "You are offline. Showing downloaded content.",
    searchPlaceholder: "Search resources by title or description...",
    recommended: "Recommended for You",
    startLearning: "Start Learning",
    download: "Download",
    downloading: "Downloading...",
    offlineReady: "Offline Ready",
    remove: "Remove",
    noResources: "No resources found",
    tryAdjusting: "Try adjusting your search or connection status.",
    home: "Home",
    portal: "Portal",
    admin: "Admin",
    footer: "© 2024 GrameenConnect. Empowering Rural India.",
    privacy: "Privacy Policy",
    accessibility: "Accessibility",
    volunteer: "Volunteer",
    welcomeUser: "Welcome,",
    allResources: "All Resources",
    downloadedOnly: "Downloaded Only",
    discoverOnline: "Discover Online",
    visitWebsite: "Visit Website",
    readNow: "Read Now"
  },
  [Language.HINDI]: {
    landingTitle: "ग्रामीण कनेक्ट",
    landingSubtitle: "डिजिटल पहुंच, शिक्षा और सेवाओं के माध्यम से ग्रामीण समुदायों को सशक्त बनाना।",
    enterCitizen: "नागरिक प्रवेश",
    adminDashboard: "व्यवस्थापक डैशबोर्ड",
    adminTitle: "व्यवस्थापक डैशबोर्ड",
    adminSubtitle: "गांवों में डिजिटल साक्षरता और जुड़ाव की निगरानी।",
    logOut: "लॉग आउट",
    signIn: "साइन इन",
    activeUsers: "सक्रिय उपयोगकर्ता",
    resourcesDownloaded: "संसाधन डाउनलोड",
    helpRequests: "सहायता अनुरोध",
    mentorsActive: "सक्रिय मेंटर",
    literacyVsAdoption: "डिजिटल साक्षरता बनाम सेवा अपनाना",
    userDistribution: "क्षेत्र के अनुसार उपयोगकर्ता वितरण",
    communityFeedback: "सामुदायिक प्रतिक्रिया और समस्याएं",
    issueId: "समस्या आईडी",
    village: "गाँव",
    category: "श्रेणी",
    status: "स्थिति",
    citizenPortal: "नागरिक पोर्टल",
    portalSubtitle: "सेवाओं तक पहुंचें, कौशल सीखें और जुड़ें।",
    offlineMessage: "आप ऑफ़लाइन हैं। डाउनलोड की गई सामग्री दिखाई जा रही है।",
    searchPlaceholder: "शीर्षक या विवरण द्वारा संसाधन खोजें...",
    recommended: "आपके लिए अनुशंसित",
    startLearning: "सीखना शुरू करें",
    download: "डाउनलोड",
    downloading: "डाउनलोड हो रहा है...",
    offlineReady: "ऑफ़लाइन तैयार",
    remove: "हटाएं",
    noResources: "कोई संसाधन नहीं मिला",
    tryAdjusting: "अपनी खोज या कनेक्शन स्थिति को समायोजित करने का प्रयास करें।",
    home: "होम",
    portal: "पोर्टल",
    admin: "एडमिन",
    footer: "© 2024 ग्रामीण कनेक्ट। ग्रामीण भारत को सशक्त बनाना।",
    privacy: "गोपनीयता नीति",
    accessibility: "पहुँच-योग्यता",
    volunteer: "स्वयंसेवक",
    welcomeUser: "स्वागत है,",
    allResources: "सभी संसाधन",
    downloadedOnly: "केवल डाउनलोड किए गए",
    discoverOnline: "ऑनलाइन खोजें",
    visitWebsite: "वेबसाइट पर जाएं",
    readNow: "अभी पढ़ें"
  },
  [Language.TELUGU]: {
    landingTitle: "గ్రామీణ్ కనెక్ట్",
    landingSubtitle: "డిజిటల్ యాక్సెస్, విద్య మరియు సేవల ద్వారా గ్రామీణ వర్గాలను శక్తివంతం చేయడం.",
    enterCitizen: "పౌరుడిగా ప్రవేశించండి",
    adminDashboard: "అడ్మిన్ డాష్‌బోర్డ్",
    adminTitle: "అడ్మినిస్ట్రేటర్ డాష్‌బోర్డ్",
    adminSubtitle: "గ్రామాల్లో డిజిటల్ అక్షరాస్యత మరియు నిశ్చితార్థాన్ని పర్యవేక్షించడం.",
    logOut: "లాగ్ అవుట్",
    signIn: "సైన్ ఇన్",
    activeUsers: "యాక్టివ్ వినియోగదారులు",
    resourcesDownloaded: "డౌన్‌లోడ్ చేసిన వనరులు",
    helpRequests: "సహాయ అభ్యర్థనలు",
    mentorsActive: "యాక్టివ్ మెంటార్స్",
    literacyVsAdoption: "డిజిటల్ అక్షరాస్యత vs సేవా స్వీకరణ",
    userDistribution: "ప్రాంతం వారీగా వినియోగదారు పంపిణీ",
    communityFeedback: "సంఘం ఫీడ్‌బ్యాక్ & సమస్యలు",
    issueId: "సమస్య ID",
    village: "గ్రామం",
    category: "వర్గం",
    status: "స్థితి",
    citizenPortal: "పౌర పోర్టల్",
    portalSubtitle: "సేవలను యాక్సెస్ చేయండి, నైపుణ్యాలను నేర్చుకోండి.",
    offlineMessage: "మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. డౌన్‌లోడ్ చేసిన కంటెంట్ చూపబడుతోంది.",
    searchPlaceholder: "వనరులను శోధించండి...",
    recommended: "మీ కోసం సిఫార్సు చేయబడింది",
    startLearning: "నేర్చుకోవడం ప్రారంభించండి",
    download: "డౌన్‌లోడ్",
    downloading: "డౌన్‌లోడ్ అవుతోంది...",
    offlineReady: "ఆఫ్‌లైన్ రెడీ",
    remove: "తొలగించు",
    noResources: "వనరులు కనుగొనబడలేదు",
    tryAdjusting: "మీ శోధనను సర్దుబాటు చేయడానికి ప్రయత్నించండి.",
    home: "హోమ్",
    portal: "పోర్టల్",
    admin: "అడ్మిన్",
    footer: "© 2024 గ్రామీణ్ కనెక్ట్. గ్రామీణ భారతదేశాన్ని శక్తివంతం చేయడం.",
    privacy: "గోప్యతా విధానం",
    accessibility: "ప్రాప్యత",
    volunteer: "వాలంటీర్",
    welcomeUser: "స్వాగతం,",
    allResources: "అన్ని వనరులు",
    downloadedOnly: "డౌన్‌లోడ్ చేయబడినవి మాత్రమే",
    discoverOnline: "ఆన్‌లైన్‌లో కనుగొనండి",
    visitWebsite: "వెబ్‌సైట్‌ను సందర్శించండి",
    readNow: "ఇప్పుడే చదవండి"
  },
  [Language.TAMIL]: {
    landingTitle: "கிராமீன் கனெக்ட்",
    landingSubtitle: "டிஜிட்டல் அணுகல், கல்வி மற்றும் சேவைகள் மூலம் கிராமப்புற சமூகங்களை மேம்படுத்துதல்.",
    enterCitizen: "குடிமகனாக நுழையுங்கள்",
    adminDashboard: "நிர்வாகக் குழு",
    adminTitle: "நிர்வாகி டாஷ்போர்டு",
    adminSubtitle: "கிராமங்களில் டிஜிட்டல் கல்வியறிவு மற்றும் ஈடுபாட்டைக் கண்காணித்தல்.",
    logOut: "வெளியேறு",
    signIn: "உள்நுழைக",
    activeUsers: "செயலில் உள்ள பயனர்கள்",
    resourcesDownloaded: "பதிவிறக்கம் செய்யப்பட்ட வளங்கள்",
    helpRequests: "உதவி கோரிக்கைகள்",
    mentorsActive: "செயலில் உள்ள வழிகாட்டிகள்",
    literacyVsAdoption: "டிஜிட்டல் கல்வியறிவு மற்றும் சேவை தத்தெடுப்பு",
    userDistribution: "பகுதி வாரியாக பயனர் விநியோகம்",
    communityFeedback: "சமூக கருத்து & சிக்கல்கள்",
    issueId: "சிக்கல் ஐடி",
    village: "கிராமம்",
    category: "வகை",
    status: "நிலை",
    citizenPortal: "குடிமக்கள் போர்டல்",
    portalSubtitle: "சேவைகளை அணுகவும், திறன்களைக் கற்றுக்கொள்ளவும்.",
    offlineMessage: "நீங்கள் ஆஃப்லைனில் உள்ளீர்கள்.",
    searchPlaceholder: "வளங்களைத் தேடுங்கள்...",
    recommended: "உங்களுக்காகப் பரிந்துரைக்கப்படுகிறது",
    startLearning: "கற்கத் தொடங்குங்கள்",
    download: "பதிவிறக்க",
    downloading: "பதிவிறக்குகிறது...",
    offlineReady: "ஆஃப்லைன் தயார்",
    remove: "அகற்று",
    noResources: "வளங்கள் எதுவும் கிடைக்கவில்லை",
    tryAdjusting: "உங்கள் தேடலைச் சரிசெய்யவும்.",
    home: "முகப்பு",
    portal: "போர்டல்",
    admin: "நிர்வாகி",
    footer: "© 2024 கிராமீன் கனெக்ட்.",
    privacy: "தனியுரிமைக் கொள்கை",
    accessibility: "அணுகல்தன்மை",
    volunteer: "தன்னார்வலர்",
    welcomeUser: "வணக்கம்,",
    allResources: "அனைத்து வளங்கள்",
    downloadedOnly: "பதிவிறக்கம் செய்யப்பட்டது மட்டும்",
    discoverOnline: "ஆன்லைனில் கண்டறியவும்",
    visitWebsite: "இணையதளத்தைப் பார்வையிடவும்",
    readNow: "இப்போது படியுங்கள்"
  },
  [Language.MALAYALAM]: {
    landingTitle: "ഗ്രാമീൺ കണക്റ്റ്",
    landingSubtitle: "ഡിജിറ്റൽ ആക്സസ്, വിദ്യാഭ്യാസം, സേവനങ്ങൾ എന്നിവയിലൂടെ ഗ്രാമീണ കമ്മ്യൂണിറ്റികളെ ശാക്തീകരിക്കുന്നു.",
    enterCitizen: "പൗരനായി പ്രവേശിക്കുക",
    adminDashboard: "അഡ്മിൻ ഡാഷ്‌ബോർഡ്",
    adminTitle: "അഡ്മിനിസ്ട്രേറ്റർ ഡാഷ്‌ബോർഡ്",
    adminSubtitle: "ഗ്രാമങ്ങളിലുടനീളം ഡിജിറ്റൽ സാക്ഷരതയും ഇടപെടലും നിരീക്ഷിക്കുന്നു.",
    logOut: "ലോഗ് ഔട്ട്",
    signIn: "സൈൻ ഇൻ",
    activeUsers: "സജീവ ഉപയോക്താക്കൾ",
    resourcesDownloaded: "ഡൗൺലോഡ് ചെയ്ത ഉറവിടങ്ങൾ",
    helpRequests: "സഹായ അഭ്യർത്ഥനകൾ",
    mentorsActive: "സജീവ മെൻ്റർമാർ",
    literacyVsAdoption: "ഡിജിറ്റൽ സാക്ഷരതയും സേവന സ്വീകാര്യതയും",
    userDistribution: "പ്രദേശം അനുസരിച്ചുള്ള ഉപയോക്തൃ വിതരണം",
    communityFeedback: "കമ്മ്യൂണിറ്റി ഫീഡ്‌ബാക്ക്",
    issueId: "ഇഷ്യു ഐഡി",
    village: "ഗ്രാമം",
    category: "വിഭാഗം",
    status: "അവസ്ഥ",
    citizenPortal: "സിറ്റിസൺ പോർട്ടൽ",
    portalSubtitle: "സേവനങ്ങൾ ആക്‌സസ് ചെയ്യുക, കഴിവുകൾ പഠിക്കുക.",
    offlineMessage: "നിങ്ങൾ ഓഫ്‌ലൈനിലാണ്. ഡൗൺലോഡ് ചെയ്ത ഉള്ളടക്കം കാണിക്കുന്നു.",
    searchPlaceholder: "ഉറവിടങ്ങൾ തിരയുക...",
    recommended: "നിങ്ങൾക്കായി ശുപാർശ ചെയ്യുന്നത്",
    startLearning: "പഠനം തുടങ്ങുക",
    download: "ഡൗൺലോഡ്",
    downloading: "ഡൗൺലോഡ് ചെയ്യുന്നു...",
    offlineReady: "ഓഫ്‌ലൈൻ തയ്യാറാണ്",
    remove: "നീക്കം ചെയ്യുക",
    noResources: "ഉറവിടങ്ങളൊന്നും കണ്ടെത്തിയില്ല",
    tryAdjusting: "തിരയൽ ക്രമീകരിക്കാൻ ശ്രമിക്കുക.",
    home: "ഹോം",
    portal: "പോർട്ടൽ",
    admin: "അഡ്മിൻ",
    footer: "© 2024 ഗ്രാമീൺ കണക്റ്റ്.",
    privacy: "സ്വകാര്യതാ നയം",
    accessibility: "ആക്സസ്സിബിലിറ്റി",
    volunteer: "വോളണ്ടിയർ",
    welcomeUser: "സ്വാഗതം,",
    allResources: "എല്ലാ വിഭവങ്ങളും",
    downloadedOnly: "ഡൗൺലോഡ് ചെയ്തവ മാത്രം",
    discoverOnline: "ഓൺലൈനിൽ കണ്ടെത്തുക",
    visitWebsite: "വെബ്സൈറ്റ് സന്ദർശിക്കുക",
    readNow: "ഇപ്പോൾ വായിക്കുക"
  }
};

// Mock Data by Language
const RESOURCES_BY_LANG: Record<Language, ResourceItem[]> = {
  [Language.ENGLISH]: [
    { id: '1', title: 'UPI Payments Basics', description: 'Learn how to use BHIM and PhonePe safely.', category: ResourceCategory.FINANCE, icon: 'Smartphone', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '2', title: 'Telehealth Consultation Guide', description: 'How to book and attend a doctor appointment online.', category: ResourceCategory.HEALTH, icon: 'Stethoscope', offlineAvailable: false, downloadStatus: 'idle', progress: 0 },
    { id: '3', title: 'Government Crop Insurance', description: 'Step-by-step guide to apply for PMFBY.', category: ResourceCategory.AGRICULTURE, icon: 'Leaf', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '4', title: 'Online Banking Security', description: 'Tips to keep your bank account safe from fraud.', category: ResourceCategory.FINANCE, icon: 'Lock', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '5', title: 'Digital Land Records', description: 'How to access and read digital land records.', category: ResourceCategory.GOVERNMENT, icon: 'Landmark', offlineAvailable: false, downloadStatus: 'idle', progress: 0 },
    { id: '6', title: 'Online School Admission', description: 'Applying for school admission through online portals.', category: ResourceCategory.EDUCATION, icon: 'BookOpen', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
  ],
  [Language.HINDI]: [
    { id: '1', title: 'यूपीआई भुगतान की मूल बातें', description: 'भीम और फोनपे का सुरक्षित उपयोग करना सीखें।', category: ResourceCategory.FINANCE, icon: 'Smartphone', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '2', title: 'टेलीहेल्थ परामर्श गाइड', description: 'डॉक्टर से ऑनलाइन अपॉइंटमेंट कैसे बुक करें।', category: ResourceCategory.HEALTH, icon: 'Stethoscope', offlineAvailable: false, downloadStatus: 'idle', progress: 0 },
    { id: '3', title: 'प्रधानमंत्री फसल बीमा योजना', description: 'PMFBY के लिए आवेदन करने की चरण-दर-चरण मार्गदर्शिका।', category: ResourceCategory.AGRICULTURE, icon: 'Leaf', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '4', title: 'ऑनलाइन बैंकिंग सुरक्षा', description: 'अपने बैंक खाते को धोखाधड़ी से सुरक्षित रखने के सुझाव।', category: ResourceCategory.FINANCE, icon: 'Lock', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '5', title: 'डिजिटल भूमि रिकॉर्ड', description: 'डिजिटल भूमि रिकॉर्ड तक कैसे पहुँचें और पढ़ें।', category: ResourceCategory.GOVERNMENT, icon: 'Landmark', offlineAvailable: false, downloadStatus: 'idle', progress: 0 },
    { id: '6', title: 'ऑनलाइन स्कूल प्रवेश', description: 'ऑनलाइन पोर्टलों के माध्यम से स्कूल प्रवेश के लिए आवेदन करना।', category: ResourceCategory.EDUCATION, icon: 'BookOpen', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
  ],
  [Language.TELUGU]: [
    { id: '1', title: 'UPI చెల్లింపుల ప్రాథమిక అంశాలు', description: 'BHIM మరియు PhonePe సురక్షితంగా ఎలా ఉపయోగించాలో తెలుసుకోండి.', category: ResourceCategory.FINANCE, icon: 'Smartphone', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '2', title: 'టెలీహెల్త్ కన్సల్టేషన్ గైడ్', description: 'డాక్టర్ అపాయింట్‌మెంట్‌ని ఆన్‌లైన్‌లో ఎలా బుక్ చేసుకోవాలి.', category: ResourceCategory.HEALTH, icon: 'Stethoscope', offlineAvailable: false, downloadStatus: 'idle', progress: 0 },
    { id: '3', title: 'ప్రభుత్వ పంటల బీమా', description: 'PMFBY కోసం దరఖాస్తు చేయడానికి దశలవారీ గైడ్.', category: ResourceCategory.AGRICULTURE, icon: 'Leaf', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '4', title: 'ఆన్‌లైన్ బ్యాంకింగ్ భద్రత', description: 'మీ బ్యాంక్ ఖాతాను మోసం నుండి సురక్షితంగా ఉంచడానికి చిట్కాలు.', category: ResourceCategory.FINANCE, icon: 'Lock', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '5', title: 'డిజిటల్ భూ రికార్డులు', description: 'డిజిటల్ భూమి రికార్డులను ఎలా యాక్సెస్ చేయాలి మరియు చదవాలి.', category: ResourceCategory.GOVERNMENT, icon: 'Landmark', offlineAvailable: false, downloadStatus: 'idle', progress: 0 },
    { id: '6', title: 'ఆన్‌లైన్ స్కూల్ అడ్మిషన్', description: 'ఆన్‌లైన్ పోర్టల్‌ల ద్వారా పాఠశాల ప్రవేశానికి దరఖాస్తు చేయడం.', category: ResourceCategory.EDUCATION, icon: 'BookOpen', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
  ],
  [Language.TAMIL]: [
    { id: '1', title: 'UPI கட்டண அடிப்படைகள்', description: 'BHIM மற்றும் PhonePe ஐ எவ்வாறு பாதுகாப்பாகப் பயன்படுத்துவது என்பதை அறியவும்.', category: ResourceCategory.FINANCE, icon: 'Smartphone', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '2', title: 'டெலிஹெல்த் ஆலோசனை வழிகாட்டி', description: 'ஆன்லைனில் மருத்துவ சந்திப்பை முன்பதிவு செய்வது எப்படி.', category: ResourceCategory.HEALTH, icon: 'Stethoscope', offlineAvailable: false, downloadStatus: 'idle', progress: 0 },
    { id: '3', title: 'அரசு பயிர் காப்பீடு', description: 'PMFBY க்கு விண்ணப்பிப்பதற்கான படிப்படியான வழிகாட்டி.', category: ResourceCategory.AGRICULTURE, icon: 'Leaf', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '4', title: 'ஆன்லைன் வங்கி பாதுகாப்பு', description: 'மோசடியிலிருந்து உங்கள் வங்கிக் கணக்கைப் பாதுகாப்பாக வைப்பதற்கான உதவிக்குறிப்புகள்.', category: ResourceCategory.FINANCE, icon: 'Lock', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '5', title: 'டிஜிட்டல் நில பதிவுகள்', description: 'டிஜிட்டல் நிலப் பதிவுகளை எவ்வாறு அணுகுவது மற்றும் படிப்பது.', category: ResourceCategory.GOVERNMENT, icon: 'Landmark', offlineAvailable: false, downloadStatus: 'idle', progress: 0 },
    { id: '6', title: 'ஆன்லைன் பள்ளி சேர்க்கை', description: 'ஆன்லைன் இணையதளங்கள் மூலம் பள்ளி சேர்க்கைக்கு விண்ணப்பித்தல்.', category: ResourceCategory.EDUCATION, icon: 'BookOpen', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
  ],
  [Language.MALAYALAM]: [
    { id: '1', title: 'UPI പേയ്‌മെൻ്റ് അടിസ്ഥാനങ്ങൾ', description: 'BHIM, PhonePe എന്നിവ എങ്ങനെ സുരക്ഷിതമായി ഉപയോഗിക്കാമെന്ന് മനസിലാക്കുക.', category: ResourceCategory.FINANCE, icon: 'Smartphone', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '2', title: 'ടെലിഹെൽത്ത് കൺസൾട്ടേഷൻ ഗൈഡ്', description: 'ഓൺലൈനിൽ ഡോക്ടർ അപ്പോയിൻ്റ്മെൻ്റ് എങ്ങനെ ബുക്ക് ചെയ്യാം.', category: ResourceCategory.HEALTH, icon: 'Stethoscope', offlineAvailable: false, downloadStatus: 'idle', progress: 0 },
    { id: '3', title: 'സർക്കാർ വിള ഇൻഷുറൻസ്', description: 'PMFBY-ക്കായി അപേക്ഷിക്കുന്നതിനുള്ള ഘട്ടം ഘട്ടമായുള്ള ഗൈഡ്.', category: ResourceCategory.AGRICULTURE, icon: 'Leaf', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '4', title: 'ഓൺലൈൻ ബാങ്കിംഗ് സുരക്ഷ', description: 'തട്ടിപ്പിൽ നിന്ന് നിങ്ങളുടെ ബാങ്ക് അക്കൗണ്ട് സുരക്ഷിതമായി സൂക്ഷിക്കുന്നതിനുള്ള നുറുങ്ങുകൾ.', category: ResourceCategory.FINANCE, icon: 'Lock', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
    { id: '5', title: 'ഡിജിറ്റൽ ഭൂരേഖകൾ', description: 'ഡിജിറ്റൽ ഭൂരേഖകൾ എങ്ങനെ ആക്സസ് ചെയ്യാം, വായിക്കാം.', category: ResourceCategory.GOVERNMENT, icon: 'Landmark', offlineAvailable: false, downloadStatus: 'idle', progress: 0 },
    { id: '6', title: 'ഓൺലൈൻ സ്കൂൾ അഡ്മിഷൻ', description: 'ഓൺലൈൻ പോർട്ടലുകൾ വഴി സ്കൂൾ പ്രവേശനത്തിന് അപേക്ഷിക്കുന്നു.', category: ResourceCategory.EDUCATION, icon: 'BookOpen', offlineAvailable: true, downloadStatus: 'idle', progress: 0 },
  ]
};

const MOCK_REGION_DATA: RegionData[] = [
  { name: 'North District', literacyRate: 65, serviceAdoption: 45, users: 1200 },
  { name: 'South District', literacyRate: 82, serviceAdoption: 70, users: 2100 },
  { name: 'East Valley', literacyRate: 55, serviceAdoption: 30, users: 800 },
  { name: 'West Plains', literacyRate: 70, serviceAdoption: 60, users: 1500 },
  { name: 'Central Highlands', literacyRate: 50, serviceAdoption: 25, users: 600 },
];

const MOCK_STATS: DashboardStat[] = [
  { label: 'activeUsers', value: 5240, change: 12, trend: 'up' },
  { label: 'resourcesDownloaded', value: 1890, change: 8, trend: 'up' },
  { label: 'helpRequests', value: 145, change: -5, trend: 'down' },
  { label: 'mentorsActive', value: 42, change: 0, trend: 'neutral' },
];

// --- Components ---

const Header = ({ 
  currentLang, 
  setLanguage, 
  isOffline, 
  onLogout, 
  onLoginClick,
  user,
  onAdminClick,
  onCitizenClick,
  view
}: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleKeySelect = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
    }
  };

  const t = TRANSLATIONS[currentLang];

  return (
    <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl cursor-pointer" onClick={() => window.location.reload()}>
          <Wifi className="h-6 w-6 text-emerald-300" />
          <span>{t.landingTitle}</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
           {user && (
            <span className="text-emerald-100 text-sm flex items-center gap-1">
              <UserIcon size={14} />
              {t.welcomeUser} {user.name}
            </span>
          )}

          <nav className="flex gap-4 text-sm font-medium">
            <button onClick={() => window.location.reload()} className="hover:text-emerald-200 transition">{t.home}</button>
            <button onClick={onCitizenClick} className={`hover:text-emerald-200 transition ${view === 'citizen' ? 'text-white font-bold' : 'text-emerald-100'}`}>{t.portal}</button>
            {user?.role === UserRole.ADMIN && (
               <button onClick={onAdminClick} className={`hover:text-emerald-200 transition ${view === 'admin' ? 'text-white font-bold' : 'text-emerald-100'}`}>{t.admin}</button>
            )}
          </nav>

          <div className="h-4 w-px bg-emerald-600"></div>
          
           {/* API Key Selector */}
           <button 
            onClick={handleKeySelect}
            className="flex items-center gap-1 text-xs bg-emerald-800 hover:bg-emerald-900 px-2 py-1 rounded text-emerald-200 transition-colors"
            title="Set API Key"
          >
            <Sparkles size={12} />
            <span>API Key</span>
          </button>

          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-emerald-200">
              <Globe size={16} />
              <span className="uppercase">{currentLang}</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-xl text-slate-800 hidden group-hover:block border border-slate-100 overflow-hidden">
              {Object.values(Language).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${currentLang === lang ? 'bg-emerald-50 text-emerald-700 font-medium' : ''}`}
                >
                  {lang === Language.ENGLISH && 'English'}
                  {lang === Language.HINDI && 'हिंदी'}
                  {lang === Language.TELUGU && 'తెలుగు'}
                  {lang === Language.TAMIL && 'தமிழ்'}
                  {lang === Language.MALAYALAM && 'മലയാളം'}
                </button>
              ))}
            </div>
          </div>

          {/* Offline Status */}
          {isOffline && (
            <div className="flex items-center gap-1 text-amber-300 bg-amber-900/30 px-2 py-1 rounded">
              <WifiOff size={16} />
              <span className="text-xs font-medium">Offline</span>
            </div>
          )}

          {/* Auth Buttons */}
          {user ? (
            <Button variant="secondary" size="sm" onClick={onLogout} className="!bg-emerald-800 hover:!bg-emerald-900 text-xs">
              <LogOut size={14} className="mr-1" />
              {t.logOut}
            </Button>
          ) : (
             <Button variant="secondary" size="sm" onClick={onLoginClick} className="!bg-white !text-emerald-800 hover:!bg-emerald-50 text-xs font-bold">
              <LogIn size={14} className="mr-1" />
              {t.signIn}
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-emerald-800 p-4 space-y-4">
           {user && (
            <div className="text-emerald-100 text-sm pb-2 border-b border-emerald-700">
              {t.welcomeUser} {user.name}
            </div>
          )}
          <button onClick={onCitizenClick} className="block w-full text-left py-2 hover:bg-emerald-700 rounded px-2">{t.portal}</button>
          {user?.role === UserRole.ADMIN && (
             <button onClick={onAdminClick} className="block w-full text-left py-2 hover:bg-emerald-700 rounded px-2">{t.admin}</button>
          )}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-700">
             {Object.values(Language).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 rounded text-xs ${currentLang === lang ? 'bg-white text-emerald-800' : 'bg-emerald-700 text-white'}`}
                >
                  {lang}
                </button>
              ))}
          </div>
           {user ? (
            <button onClick={onLogout} className="flex items-center gap-2 text-amber-200 mt-4">
              <LogOut size={16} /> {t.logOut}
            </button>
          ) : (
            <button onClick={onLoginClick} className="flex items-center gap-2 text-white font-bold mt-4">
              <LogIn size={16} /> {t.signIn}
            </button>
          )}
        </div>
      )}
    </header>
  );
};

const LandingPage = ({ onEnter, language }: { onEnter: () => void, language: Language }) => {
  const t = TRANSLATIONS[language];
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-emerald-50 to-white text-center px-4">
      <div className="bg-emerald-100 p-4 rounded-full mb-6 animate-bounce">
        <Users size={48} className="text-emerald-600" />
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-4 tracking-tight">
        {t.landingTitle}
      </h1>
      <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
        {t.landingSubtitle}
      </p>
      <div className="flex gap-4 flex-col sm:flex-row">
        <Button onClick={onEnter} size="lg" className="shadow-xl shadow-emerald-200/50">
          {t.enterCitizen}
        </Button>
      </div>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <BookOpen className="h-10 w-10 text-emerald-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2">{t.portalSubtitle}</h3>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <Wifi className="h-10 w-10 text-blue-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2">{t.offlineReady}</h3>
        </div>
         <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <BarChart3 className="h-10 w-10 text-amber-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2">{t.adminTitle}</h3>
        </div>
      </div>
    </div>
  );
};

const UserPortal = ({ 
  language, 
  isOffline, 
  resources, 
  onDownload, 
  onCancelDownload, 
  onDeleteDownload,
  onDiscover,
  isDiscovering,
  user,
  onStartLearning
}: any) => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDownloadedOnly, setShowDownloadedOnly] = useState(false);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    // Generate AI recommendations based on user role/interests
    const fetchRecs = async () => {
        if (!isOffline && user) {
            const recs = await getRecommendations(user.village ? `Farmer from ${user.village}` : "Rural Citizen");
            setRecommendations(recs);
        }
    };
    fetchRecs();
  }, [isOffline, user]);

  const filteredResources = resources.filter((res: ResourceItem) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = res.title.toLowerCase().includes(query) || res.description.toLowerCase().includes(query);
    const matchesFilter = showDownloadedOnly ? res.downloadStatus === 'downloaded' : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="bg-indigo-600 rounded-2xl p-8 text-white mb-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">{t.citizenPortal}</h2>
          <p className="text-indigo-100 max-w-xl text-lg">{t.portalSubtitle}</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
      </div>

       {/* Search and Filters */}
       <div className="mb-8 max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
          />
        </div>
        
        {/* Filter Toggle */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
                onClick={() => setShowDownloadedOnly(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showDownloadedOnly ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                {t.allResources}
            </button>
            <button
                onClick={() => setShowDownloadedOnly(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${showDownloadedOnly ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Check size={14} />
                {t.downloadedOnly}
            </button>
        </div>
      </div>
      
      {/* Online Discovery Action */}
      {!isOffline && !showDownloadedOnly && (
        <div className="flex justify-center mb-8">
           <Button 
             variant="secondary" 
             onClick={onDiscover}
             disabled={isDiscovering}
             className="rounded-full shadow-lg !px-6"
           >
             {isDiscovering ? (
               <>
                 <Loader2 size={18} className="animate-spin mr-2" />
                 {t.searchPlaceholder.split(' ')[0]}...
               </>
             ) : (
               <>
                 <Globe size={18} className="mr-2" />
                 {t.discoverOnline}
               </>
             )}
           </Button>
        </div>
      )}

      {isOffline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <WifiOff size={20} />
          {t.offlineMessage}
        </div>
      )}

      {/* AI Recommendations */}
      {!isOffline && recommendations.length > 0 && !showDownloadedOnly && (
        <div className="mb-10">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="text-amber-500" size={20} />
            {t.recommended}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-orange-100">
                <p className="font-medium text-slate-800 mb-3">{rec}</p>
                <button 
                  onClick={() => onStartLearning({ title: rec })}
                  className="text-sm text-orange-600 font-semibold hover:underline flex items-center gap-1"
                >
                    {t.startLearning} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources Grid */}
      <h3 className="text-xl font-bold text-slate-800 mb-6">{showDownloadedOnly ? t.downloadedOnly : t.allResources}</h3>
      
      {filteredResources.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>{t.noResources}</p>
          <p className="text-sm">{t.tryAdjusting}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource: ResourceItem) => (
            <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    resource.category === ResourceCategory.FINANCE ? 'bg-blue-100 text-blue-600' :
                    resource.category === ResourceCategory.HEALTH ? 'bg-red-100 text-red-600' :
                    resource.category === ResourceCategory.AGRICULTURE ? 'bg-green-100 text-green-600' :
                    resource.icon === 'Globe' ? 'bg-purple-100 text-purple-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {resource.icon === 'Smartphone' && <Smartphone size={24} />}
                    {resource.icon === 'Stethoscope' && <Stethoscope size={24} />}
                    {resource.icon === 'Leaf' && <Leaf size={24} />}
                    {resource.icon === 'Landmark' && <Landmark size={24} />}
                    {resource.icon === 'BookOpen' && <BookOpen size={24} />}
                    {resource.icon === 'Lock' && <Landmark size={24} />}
                    {resource.icon === 'Globe' && <Globe size={24} />} 
                  </div>
                  {resource.offlineAvailable && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                      {t.offlineReady}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">{resource.title}</h4>
                <p className="text-slate-600 text-sm">{resource.description}</p>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                 {resource.link ? (
                    <a 
                      href={resource.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full h-9 px-3 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      {t.visitWebsite}
                    </a>
                 ) : resource.downloadStatus === 'downloading' ? (
                   <div className="space-y-2">
                     <div className="flex justify-between text-xs font-medium text-slate-600">
                        <span>{t.downloading}</span>
                        <span>{resource.progress}%</span>
                     </div>
                     <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                       <div 
                         className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" 
                         style={{ width: `${resource.progress}%` }}
                       ></div>
                     </div>
                     <button 
                       onClick={() => onCancelDownload(resource.id)}
                       className="text-xs text-red-500 hover:underline w-full text-center mt-1"
                     >
                       Cancel
                     </button>
                   </div>
                 ) : (
                   <div className="flex gap-2">
                       {/* Only show Download if not downloaded and supports offline */}
                       {resource.downloadStatus !== 'downloaded' && resource.offlineAvailable && (
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="flex-1"
                           onClick={() => onDownload(resource.id)}
                           disabled={isOffline && !resource.offlineAvailable}
                         >
                           <Download size={16} className="mr-2" />
                           {t.download}
                         </Button>
                       )}
                       
                       {/* Show Read/Open if downloaded OR if online OR default available */}
                       {(resource.downloadStatus === 'downloaded' || !isOffline || resource.offlineAvailable) && (
                         <Button
                           variant={resource.downloadStatus === 'downloaded' ? 'primary' : 'secondary'}
                           size="sm"
                           className="flex-1"
                           onClick={() => onStartLearning(resource)}
                         >
                           <PlayCircle size={16} className="mr-2" />
                           {t.readNow}
                         </Button>
                       )}
                       
                       {resource.downloadStatus === 'downloaded' && (
                          <button 
                            onClick={() => onDeleteDownload(resource.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-2"
                            title={t.remove}
                          >
                            <Trash2 size={18} />
                          </button>
                       )}
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminDashboard = ({ language }: { language: Language }) => {
  const t = TRANSLATIONS[language];
  const stats = MOCK_STATS.map(stat => ({
      ...stat,
      label: t[stat.label as keyof typeof t] || stat.label
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">{t.adminTitle}</h2>
        <p className="text-slate-600">{t.adminSubtitle}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                stat.trend === 'up' ? 'text-emerald-700 bg-emerald-50' : 
                stat.trend === 'down' ? 'text-red-700 bg-red-50' : 
                'text-slate-700 bg-slate-100'
              }`}>
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts data={MOCK_REGION_DATA} />

      {/* Recent Feedback Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-lg text-slate-800">{t.communityFeedback}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-3">{t.issueId}</th>
                <th className="px-6 py-3">{t.village}</th>
                <th className="px-6 py-3">{t.category}</th>
                <th className="px-6 py-3">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-3 font-mono">#REQ-2024-001</td>
                <td className="px-6 py-3">Rampur</td>
                <td className="px-6 py-3">Connectivity</td>
                <td className="px-6 py-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">Pending</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-3 font-mono">#REQ-2024-002</td>
                <td className="px-6 py-3">Lakhanpur</td>
                <td className="px-6 py-3">Training</td>
                <td className="px-6 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">Resolved</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-3 font-mono">#REQ-2024-003</td>
                <td className="px-6 py-3">Sonpur</td>
                <td className="px-6 py-3">Hardware</td>
                <td className="px-6 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">In Progress</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [currentLang, setCurrentLang] = useState<Language>(Language.ENGLISH);
  const [view, setView] = useState<'landing' | 'citizen' | 'admin' | 'learning'>('landing');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [user, setUser] = useState<User | null>(null);
  const [resources, setResources] = useState<ResourceItem[]>(RESOURCES_BY_LANG[Language.ENGLISH]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [activeLesson, setActiveLesson] = useState<ResourceItem | {title: string} | null>(null);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Auth & Progress
  useEffect(() => {
    const session = db.getSession();
    if (session) {
      setUser(session);
      // Load progress but map it to currently selected language resources
      loadUserProgress(session.id, currentLang);
    } else {
      // If no session, just load raw resources for current lang
      setResources(RESOURCES_BY_LANG[currentLang]);
    }
  }, [currentLang]); // Re-run when language changes

  const loadUserProgress = (userId: string, lang: Language) => {
    const progressMap = db.getUserProgress(userId);
    const rawResources = RESOURCES_BY_LANG[lang];
    
    setResources(rawResources.map(res => {
        const p = progressMap[res.id];
        return p ? { ...res, downloadStatus: p.downloadStatus, progress: p.progress } : res;
    }));
  };

  const handleLogin = async (data: any) => {
    const user = await db.login(data.email, data.password);
    setUser(user);
    loadUserProgress(user.id, currentLang);
    if (user.role === UserRole.ADMIN) setView('admin');
    else setView('citizen');
  };

  const handleRegister = async (data: any) => {
    const user = await db.register(data.name, data.email, data.password, data.village);
    setUser(user);
    loadUserProgress(user.id, currentLang);
    setView('citizen');
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
    setView('landing');
    // Reset resource local state to current lang default without progress
    setResources(RESOURCES_BY_LANG[currentLang]); 
  };

  const handleDiscoverOnline = async () => {
    setIsDiscovering(true);
    const newItems = await fetchWebResources(currentLang);
    setResources(prev => [...newItems, ...prev]);
    setIsDiscovering(false);
  };

  const handleStartLearning = (item: ResourceItem | { title: string }) => {
    setActiveLesson(item);
    setView('learning');
  };

  // Download Simulation
  const timers = useRef<Record<string, number>>({});

  const startDownload = (id: string) => {
    if (!user) {
        setShowAuthModal(true);
        return;
    }

    setResources(prev => prev.map(r => r.id === id ? { ...r, downloadStatus: 'downloading', progress: 0 } : r));
    
    // Simulate progress
    const interval = window.setInterval(() => {
        setResources(prev => {
            const resource = prev.find(r => r.id === id);
            if (!resource || resource.downloadStatus !== 'downloading') return prev;

            const nextProgress = resource.progress + 10;
            if (nextProgress >= 100) {
                clearInterval(timers.current[id]);
                const updated = { ...resource, progress: 100, downloadStatus: 'downloaded' as const };
                // Persist
                db.saveUserProgress(user.id, id, { progress: 100, downloadStatus: 'downloaded' });
                return prev.map(r => r.id === id ? updated : r);
            }
            
            // Persist intermediate (optional, maybe less frequent in real app)
            return prev.map(r => r.id === id ? { ...r, progress: nextProgress } : r);
        });
    }, 500);

    timers.current[id] = interval;
  };

  const cancelDownload = (id: string) => {
    if (timers.current[id]) clearInterval(timers.current[id]);
    setResources(prev => prev.map(r => r.id === id ? { ...r, downloadStatus: 'idle', progress: 0 } : r));
    if (user) db.saveUserProgress(user.id, id, { downloadStatus: 'idle', progress: 0 });
  };

  const deleteDownload = (id: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, downloadStatus: 'idle', progress: 0 } : r));
    if (user) db.saveUserProgress(user.id, id, { downloadStatus: 'idle', progress: 0 });
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header 
        currentLang={currentLang} 
        setLanguage={setCurrentLang} 
        isOffline={isOffline}
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuthModal(true)}
        onAdminClick={() => setView('admin')}
        onCitizenClick={() => {
            if(!user) setShowAuthModal(true);
            else setView('citizen');
        }}
        view={view}
      />

      <main className="animate-in fade-in duration-300">
        {view === 'landing' && (
          <LandingPage 
            language={currentLang} 
            onEnter={() => {
                if(user) setView('citizen');
                else setShowAuthModal(true);
            }} 
          />
        )}

        {view === 'citizen' && (
          <UserPortal 
            language={currentLang} 
            isOffline={isOffline} 
            resources={resources}
            user={user}
            onDownload={startDownload}
            onCancelDownload={cancelDownload}
            onDeleteDownload={deleteDownload}
            onDiscover={handleDiscoverOnline}
            isDiscovering={isDiscovering}
            onStartLearning={handleStartLearning}
          />
        )}

        {view === 'learning' && activeLesson && (
          <LearningPage 
            resource={activeLesson}
            language={currentLang}
            onBack={() => setView('citizen')}
          />
        )}

        {view === 'admin' && (
          <AdminDashboard language={currentLang} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <div className="container mx-auto px-4">
          <p className="mb-4">{TRANSLATIONS[currentLang].footer}</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-emerald-400">{TRANSLATIONS[currentLang].privacy}</a>
            <a href="#" className="hover:text-emerald-400">{TRANSLATIONS[currentLang].accessibility}</a>
            <a href="#" className="hover:text-emerald-400">{TRANSLATIONS[currentLang].volunteer}</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        language={currentLang}
      />

      {/* Chat Assistant */}
      {!isOffline && <ChatAssistant language={currentLang} />}
    </div>
  );
};

export default App;
