import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { checkEmailDomain, registerUser } from '../../lib/api-client';
import { 
  Building, 
  FolderOpen, 
  Lock, 
  CheckCircle2, 
  UserCheck, 
  ShieldCheck, 
  Coins, 
  ArrowRight, 
  FileText, 
  Search, 
  Download, 
  Plus, 
  HelpCircle, 
  Globe, 
  FileCheck, 
  Database,
  Terminal,
  Grid,
  TrendingUp,
  Sliders,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  ChevronDown,
  AlertTriangle,
  Send,
  RefreshCw,
  Eye,
  Check,
  Bell,
  BellOff,
  Sun,
  Moon,
  Trophy
} from 'lucide-react';

export interface DocumentReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  date: string;
  university: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  university: string;
  faculty: string;
  semester: string;
  price: number;
  rating: number;
  reviewsCount: number;
  authorName: string;
  authorVerified: boolean;
  authorDegree: string;
  verifiedBadge: string;
  previewPages: string[];
  docType: string;
  downloads: number;
  featured?: boolean;
  reviewsList?: DocumentReview[];
  createdAt?: number;
}

const DEMO_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Signals & Systems Master Exam Solutions',
    courseCode: '046200',
    courseName: 'Signals & Systems',
    university: 'Technion — IIT',
    faculty: 'Electrical Engineering',
    semester: 'Spring 2024',
    price: 15,
    rating: 4.9,
    reviewsCount: 38,
    authorName: 'Yossi G.',
    authorVerified: true,
    authorDegree: 'B.Sc. Computer Engineering (Year 3)',
    verifiedBadge: 'Technion Verified',
    previewPages: [
      'Fourier Transform properties mapped sequentially with hand-drawn block diagrams.',
      'Moed A (Jan 2024) full worked answers with step-by-step laplace region decompositions.',
      'Fourier series convolution tricks that professors recycle on finals.',
      '[BLURRED] High-resolution grid showing matched transfer functions.'
    ],
    docType: 'Past Exams with Worked Solutions',
    downloads: 142,
    featured: true,
    createdAt: 1718020000000
  },
  {
    id: 'doc-2',
    title: 'Complete Intro to Machine Learning Notebook',
    courseCode: '236756',
    courseName: 'Introduction to Machine Learning',
    university: 'Tel Aviv University',
    faculty: 'Computer Science',
    semester: 'Fall 2024',
    price: 20,
    rating: 4.8,
    reviewsCount: 54,
    authorName: 'Dr. Sarah A.',
    authorVerified: true,
    authorDegree: 'M.Sc. Data Science Graduate',
    verifiedBadge: 'TAU Verified',
    previewPages: [
      'Comprehensive mathematical formulation of Backpropagation and Gradient Descent mechanics.',
      'Comparison matrix: SVM, Random Forests, and Multi-Layer Perceptrons tuning boundaries.',
      'Quick review cheat sheet on validation limits and curse of dimensionality.',
      '[BLURRED] Advanced linear clustering proofs and margin bounds calculation.'
    ],
    docType: 'Full-Course Lecture Summaries',
    downloads: 289,
    featured: true,
    createdAt: 1717840000000
  },
  {
    id: 'doc-3',
    title: 'Data Structures and Algorithms Core Cheatsheet',
    courseCode: 'CSE214',
    courseName: 'Data Structures & Algorithms',
    university: 'Ben-Gurion University',
    faculty: 'Software Engineering',
    semester: 'Spring 2024',
    price: 8,
    rating: 5.0,
    reviewsCount: 112,
    authorName: 'Amit Cohen',
    authorVerified: true,
    authorDegree: 'Software Engineering Alumnus',
    verifiedBadge: 'BGU Verified',
    previewPages: [
      'A dense 2-page printout with code snippets in Java for Trees, Graphs, and Hashmaps.',
      'Complexity index table for major sorting algorithms (Quick, Merge, Heap) under spatial limits.',
      'BFS vs DFS visual layout guide for quick final lookup.',
      '[BLURRED] Binary search tree rotatory animations blueprint representation.'
    ],
    docType: 'Multi-Page Finals Cheat Sheets',
    downloads: 412,
    featured: true,
    createdAt: 1718106000000
  },
  {
    id: 'doc-4',
    title: 'Organic Chemistry Synthesis Map Package',
    courseCode: 'CHEM201',
    courseName: 'Organic Chemistry I',
    university: 'Oxford University',
    faculty: 'Chemistry Sciences',
    semester: 'Year 1 Tripos',
    price: 18,
    rating: 4.7,
    reviewsCount: 29,
    authorName: 'Claire M.',
    authorVerified: true,
    authorDegree: 'Ph.D. Chemistry Candidate',
    verifiedBadge: 'Oxford Verified',
    previewPages: [
      'Step-by-step nucleophilic substitution mechanism curves (SN1 vs SN2 vs E1/E2).',
      'Curated list of 40 standard reaction pathways with reagents, catalysts, and yields.',
      'Acid-catalyzed hydration templates with stereochemical outcome predictions.',
      '[BLURRED] Resonance hybrid structures on charcoal-derived grid models.'
    ],
    docType: 'Concept Maps & Visual Study Guides',
    downloads: 87,
    createdAt: 1715340000000
  },
  {
    id: 'doc-5',
    title: 'Introduction to Microeconomics Summarized Finals Deck',
    courseCode: 'ECON101',
    courseName: 'Principles of Economics',
    university: 'MIT',
    faculty: 'Social Sciences',
    semester: 'Fall 2023',
    price: 10,
    rating: 4.6,
    reviewsCount: 42,
    authorName: 'John B.',
    authorVerified: true,
    authorDegree: 'Economics major (Year 2)',
    verifiedBadge: 'MIT Verified',
    previewPages: [
      'Supply/demand price elasticity index charts mapped alongside consumer surplus equations.',
      'Monopolistic competition equations with dry visual profit-maximization plots.',
      'Deadweight loss variables caused by government tax overlays.',
      '[BLURRED] Game Theory oligopoly payoff matrices calculations.'
    ],
    docType: 'Compact Formulas & Notebooks',
    downloads: 198,
    createdAt: 1712660000000
  }
];

export interface RequestItem {
  id: string;
  title: string;
  university: string;
  courseCode: string;
  bounty: number;
  deadline: string;
  bidsCount: number;
  requester: string;
  status: 'Open' | 'Fulfill-In-Progress' | 'Completed';
  terroir: string;
}

const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: 'req-1',
    title: 'Need Worked Solutions for 2024 Moed A - Intro to NLP',
    university: 'Ben-Gurion University',
    courseCode: 'BGU-NLP-312',
    bounty: 80,
    deadline: 'In 3 days',
    bidsCount: 4,
    requester: 'Maya L.',
    status: 'Open',
    terroir: 'BGU Computer Science'
  },
  {
    id: 'req-2',
    title: 'Lab Report 3: Physics III Harmonic Oscillations Data & Equations',
    university: 'Technion — IIT',
    courseCode: '114053',
    bounty: 45,
    deadline: 'In 5 days',
    bidsCount: 2,
    requester: 'Tom S.',
    status: 'Fulfill-In-Progress',
    terroir: 'Technion Physics'
  },
  {
    id: 'req-3',
    title: 'Vector Calculus Condensed Formula Handout',
    university: 'Tel Aviv University',
    courseCode: '0321-1120',
    bounty: 30,
    deadline: 'In 12 days',
    bidsCount: 1,
    requester: 'Daniel K.',
    status: 'Open',
    terroir: 'TAU Math'
  }
];

export interface MonorepoFile {
  path: string;
  description: string;
  code: string;
}

const MONOREPO_FILES: Record<string, MonorepoFile> = {
  'UniversityRegistry.ts': {
    path: 'packages/utils/UniversityRegistry.ts',
    description: 'Central registry of university domain endpoints to verify student identities in Layer 1 securely.',
    code: `export interface InstitutionalRoute {
  domain: string;
  institutionName: string;
  country: string;
  shortCode: string;
  iconAccent: string;
}

export const INSTITUTIONAL_REGISTRY: Record<string, InstitutionalRoute> = {
  'technion.ac.il': { domain: 'technion.ac.il', institutionName: 'Technion - Israel Institute of Technology', country: 'IL', shortCode: 'TECHNION', iconAccent: '#0A2F44' },
  'tau.ac.il': { domain: 'tau.ac.il', institutionName: 'Tel Aviv University', country: 'IL', shortCode: 'TAU', iconAccent: '#1C6E8F' },
  'post.bgu.ac.il': { domain: 'post.bgu.ac.il', institutionName: 'Ben-Gurion University', country: 'IL', shortCode: 'BGU', iconAccent: '#1C6E8F' },
  'mit.edu': { domain: 'mit.edu', institutionName: 'Massachusetts Institute of Technology', country: 'US', shortCode: 'MIT', iconAccent: '#0c3b4f' },
  'ox.ac.uk': { domain: 'ox.ac.uk', institutionName: 'University of Oxford', country: 'UK', shortCode: 'OXFORD', iconAccent: '#5b7c9c' }
};

export function lookupUniversityByEmail(email: string): InstitutionalRoute | null {
  const parts = email.toLowerCase().split('@');
  if (parts.length !== 2) return null;
  const domain = parts[1];
  for (const regDomain in INSTITUTIONAL_REGISTRY) {
    if (domain === regDomain || domain.endsWith('.' + regDomain)) return INSTITUTIONAL_REGISTRY[regDomain];
  }
  return null;
}`
  },
  'StripePayment.ts': {
    path: 'services/payment-service/StripePayment.ts',
    description: 'Stripe payments interface supporting localized payments (Bit, card, etc), utilizing lazy client initialization as required.',
    code: `import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripeInstance(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is missing in your application environment secrets.');
    stripeClient = new Stripe(key, { apiVersion: '2023-10-16' as any });
  }
  return stripeClient;
}

export interface SplitPaymentInstruction {
  buyerId: string;
  sellerId: string;
  totalAmount: number;
  documentId: string;
}

export async function createSplitTransaction(payload: SplitPaymentInstruction) {
  const stripe = getStripeInstance();
  const platformFeeAmount = Math.round(payload.totalAmount * 0.30);
  const sellerEarningAmount = payload.totalAmount - platformFeeAmount;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: payload.totalAmount,
    currency: 'ils',
    payment_method_types: ['card'],
    metadata: { document_id: payload.documentId, seller_payout_amount: sellerEarningAmount.toString(), platform_fee: platformFeeAmount.toString() }
  });
  return { clientSecret: paymentIntent.client_secret, sellerPayout: sellerEarningAmount, platformFee: platformFeeAmount };
}`
  },
  'schema.prisma': {
    path: 'database/schema.prisma',
    description: 'PostgreSQL Relational schema mapping verified user identities, multi-semester courses, buy-transactions, and verified peer reviews.',
    code: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id               String    @id @default(uuid())
  email            String    @unique
  fullName         String
  universityDomain String
  institutionName  String
  facultyName      String?
  reputationPoints Int       @default(100)
  payoutWalletId   String?
  isVerified       Boolean   @default(false)
  kycCompleted     Boolean   @default(false)
  role             UserRole  @default(STUDENT)
  documentsOwned   Document[] @relation("BuyerRelation")
  documentsAuthored Document[] @relation("SellerRelation")
  requestsMade     MaterialRequest[]
  bidsMade         RequestBid[]
  reviewsAuthored  Review[]
  createdAt        DateTime  @default(now())
}

model Document {
  id             String    @id @default(uuid())
  title          String
  courseCode     String
  courseName     String
  semester       String
  priceILS       Int
  fileUrl        String
  snippetPreview String[]
  docType        String
  authorId       String
  author         User      @relation("SellerRelation", fields: [authorId], references: [id])
  purchasedBy    User[]    @relation("BuyerRelation")
  reviews        Review[]
  downloadCount  Int       @default(0)
  createdAt      DateTime  @default(now())
}

model MaterialRequest {
  id           String     @id @default(uuid())
  title        String
  courseCode   String     @unique
  bountyAmount Int
  deadline     DateTime
  requesterId  String
  requester    User       @relation(fields: [requesterId], references: [id])
  bids         RequestBid[]
  status       Status     @default(OPEN)
}

model RequestBid {
  id        String          @id @default(uuid())
  requestId String
  request   MaterialRequest @relation(fields: [requestId], references: [id])
  sellerId  String
  priceBid  Int
  message   String
}

model Review {
  id         String   @id @default(uuid())
  score      Int
  text       String
  documentId String
  document   Document @relation(fields: [documentId], references: [id])
  authorId   String
  author     User     @relation(fields: [authorId], references: [id])
}

enum UserRole { STUDENT ALUMNI TEACHING_ASSISTANT }
enum Status { OPEN ASSIGNED COMPLETED }`
  },
  'FramerMotionThemes.ts': {
    path: 'packages/ui/FramerMotionThemes.ts',
    description: 'Shared animations presets that maintain the beautiful Clean Minimalism structural motion layout rules.',
    code: `export const FADE_TRANSITION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
};

export const GRID_STAGGER_PRESET = {
  animate: { transition: { staggerChildren: 0.05 } }
};`
  }
};

const getDocTypeIcon = (docType: string) => {
  const norm = docType.toLowerCase();
  if (norm.includes('exam') || norm.includes('solution')) return <FileCheck className="w-3.5 h-3.5 text-[#1C6E8F]" />;
  if (norm.includes('summary') || norm.includes('lecture')) return <BookOpen className="w-3.5 h-3.5 text-indigo-600" />;
  if (norm.includes('cheat') || norm.includes('formula') || norm.includes('notebook')) return <Layers className="w-3.5 h-3.5 text-emerald-600" />;
  if (norm.includes('map') || norm.includes('guide') || norm.includes('visual')) return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
  return <FileText className="w-3.5 h-3.5 text-stone-500" />;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'auth' | 'strategic' | 'explorer'>('marketplace');
  const [documents, setDocuments] = useState<DocumentItem[]>(() => DEMO_DOCUMENTS.map(doc => {
    if (doc.id === 'doc-1') return { ...doc, reviewsList: [{ id: 'rev-1-1', authorName: 'Or S.', rating: 5, text: 'Lifesaver summary. The Signals series at our faculty is notoriously difficult but this worked answer sheet laid it out better than the standard syllabus tutorials.', date: 'May 12, 2025', university: 'Technion' }, { id: 'rev-1-2', authorName: 'Samer A.', rating: 4.8, text: 'Very accurate worked solutions. Highly recommend on the finals.', date: 'April 28, 2025', university: 'Technion' }] };
    if (doc.id === 'doc-2') return { ...doc, reviewsList: [{ id: 'rev-2-1', authorName: 'Liran M.', rating: 4.8, text: 'Highly comprehensive machine learning cheat sheet notes. The math formulation is crisp and extremely well laid out.', date: 'May 19, 2025', university: 'TAU' }] };
    if (doc.id === 'doc-3') return { ...doc, reviewsList: [{ id: 'rev-3-1', authorName: 'Noam D.', rating: 5, text: 'Literally everything you need for Data Structures and Algorithms final is packed in these 2-3 pages. Saved me semesters of confusion!', date: 'June 01, 2025', university: 'BGU' }] };
    return { ...doc, reviewsList: [] };
  }));
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewAuthor, setNewReviewAuthor] = useState('Daniel Alon');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('All');
  const [selectedDocType, setSelectedDocType] = useState('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Highest Rated' | 'Most Popular'>('Newest');
  const [activeDocId, setActiveDocId] = useState<string>('doc-1');
  const [showDocPreviewModal, setShowDocPreviewModal] = useState(false);
  const [simulatePurchaseStatus, setSimulatePurchaseStatus] = useState<'idle' | 'success' | 'purchasing'>('idle');
  const [purchaseHistory, setPurchaseHistory] = useState<string[]>([]);
  const [sellerLeaderboard, setSellerLeaderboard] = useState<Record<string, number>>({ 'Yossi G.': 2130, 'Dr. Sarah A.': 5780, 'Amit Cohen': 3296, 'Claire M.': 1566 });
  const [testEmail, setTestEmail] = useState('dan@student.technion.ac.il');
  const [detectedInstitution, setDetectedInstitution] = useState<any>({ domain: 'technion.ac.il', institutionName: 'Technion - Israel Institute of Technology', country: 'IL', shortCode: 'TECHNION', iconAccent: '#0A2F44', verified: true });
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [kycFullName, setKycFullName] = useState('Daniel Alon');
  const [kycIdNumber, setKycIdNumber] = useState('328492049');
  const [kycPassword, setKycPassword] = useState('StudyMarket123!');
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<'unsubmitted' | 'processing' | 'approved' | 'failed'>('unsubmitted');
  const [behaviorLogs, setBehaviorLogs] = useState<string[]>(['System init: behavioral monitoring engine loaded.', 'Anomaly scan: 0 rapid payouts flagged.', 'Spam check: Tau lecture guide verified under threshold.']);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [followedDocIds, setFollowedDocIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(25);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const isTechnicalMode = useMemo(() => { try { const params = new URLSearchParams(window.location.search); return params.get('mode') === 'technical'; } catch (e) { return false; } }, []);
  const [onlyShowVerifiedSameUniReviews, setOnlyShowVerifiedSameUniReviews] = useState<boolean>(false);
  const [viewingSellerName, setViewingSellerName] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [showStudyBanner, setShowStudyBanner] = useState<boolean>(true);

  const showToast = (msg: string) => { const id = Date.now().toString() + Math.random().toString(36).substring(2, 9); setToasts(prev => [...prev, { id, message: msg }]); setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 3000); };

  const toggleFollowDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    setFollowedDocIds(prev => {
      const isFollowing = prev.includes(docId);
      if (isFollowing) { setBehaviorLogs(l => [`[ALERT SETTINGS] Stopped following pricing & file updates for "${doc.title}" (${doc.courseCode}).`, ...l]); showToast(`Stopped following alerts for "${doc.title}".`); return prev.filter(id => id !== docId); }
      else { setBehaviorLogs(l => [`[ALERT SETTINGS] You are now following "${doc.title}" (${doc.courseCode}). You'll receive real-time alerts if its price drops or is updated.`, ...l]); showToast(`✓ Subscribed to pricing and change alerts for "${doc.title}"!`); return [...prev, docId]; }
    });
  };

  const handleSimulatePriceDrop = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    const currentPrice = doc.price;
    if (currentPrice <= 5) { showToast(`Price for "${doc.title}" is already at minimum (₪${currentPrice}).`); return; }
    const newPrice = currentPrice - 5;
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, price: newPrice } : d));
    setBehaviorLogs(l => [`[PRICE REDUCTION] Seller updated "${doc.title}"! Price decreased from ₪${currentPrice} to ₪${newPrice}.`, ...l]);
    const isFollowingNow = followedDocIds.includes(docId);
    if (isFollowingNow) { setBehaviorLogs(l => [`[FOLLOW ALERT 🔔] Price reduction alert matched for "${doc.title}"! ₪${currentPrice} ➔ ₪${newPrice}. Notification dispatched to you.`, ...l]); showToast(`🔔 Price Drop Alert: "${doc.title}" reduced to ₪${newPrice}!`); }
    else showToast(`Simulated price drop to ₪${newPrice}! Enable alerts (follow icon) to catch notifications.`);
  };

  const handleSimulateFileUpdate = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    setDocuments(prev => prev.map(d => { if (d.id === docId) { const updatedPages = [...d.previewPages]; if (updatedPages.length > 0 && !updatedPages[0].includes('RECENTLY SYSTEM-UPDATED')) updatedPages[0] = `[RECENTLY SYSTEM-UPDATED June 2026] — Material reviewed under updated course syllabus. ` + updatedPages[0]; return { ...d, title: d.title.endsWith(' (Syllabus Rev. June 2026)') ? d.title : `${d.title} (Syllabus Rev. June 2026)`, previewPages: updatedPages }; } return d; }));
    setBehaviorLogs(l => [`[CONTENT UPDATE] Seller uploaded a corrected revision / newer solved exam files for "${doc.title}".`, ...l]);
    const isFollowingNow = followedDocIds.includes(docId);
    if (isFollowingNow) { setBehaviorLogs(l => [`[FOLLOW ALERT 🔔] Content update watch matched for "${doc.title}"! Newer revision is now available.`, ...l]); showToast(`🔔 Material Updated: "${doc.title}" has a new active revision!`); }
    else showToast(`Simulated content update for "${doc.title}"! Enable alerts to catch notifications.`);
  };

  const [disputeDocId, setDisputeDocId] = useState('doc-1');
  const [disputeExplanation, setDisputeExplanation] = useState('The hand-drawn equations in the Fourier chapter were cut off in page 2.');
  const [disputeStatus, setDisputeStatus] = useState<'idle' | 'submitted'>('idle');
  const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestCourse, setNewRequestCourse] = useState('');
  const [newRequestUniv, setNewRequestUniv] = useState('Technion — IIT');
  const [newRequestBounty, setNewRequestBounty] = useState(50);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (showDocPreviewModal) setShowDocPreviewModal(false); if (viewingSellerName) setViewingSellerName(null); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDocPreviewModal, viewingSellerName]);

  const [selectedFileKey, setSelectedFileKey] = useState<string>('UniversityRegistry.ts');
  const [copystate, setCopystate] = useState(false);

  const filteredDocuments = useMemo(() => {
    const list = documents.filter(doc => {
      const matchSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.courseName.toLowerCase().includes(searchQuery.toLowerCase()) || doc.courseCode.includes(searchQuery);
      const matchUniv = selectedUniversity === 'All' || doc.university === selectedUniversity;
      const matchType = selectedDocType === 'All' || doc.docType === selectedDocType;
      const matchPrice = doc.price >= minPrice && doc.price <= maxPrice;
      return matchSearch && matchUniv && matchType && matchPrice;
    });
    return [...list].sort((a, b) => {
      if (sortBy === 'Highest Rated') return b.rating - a.rating;
      if (sortBy === 'Most Popular') return b.downloads - a.downloads;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [documents, searchQuery, selectedUniversity, selectedDocType, sortBy, minPrice, maxPrice]);

  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return documents.filter(doc => doc.courseCode.toLowerCase().includes(q) || doc.courseName.toLowerCase().includes(q) || doc.university.toLowerCase().includes(q) || doc.authorName.toLowerCase().includes(q)).slice(0, 5);
  }, [documents, searchQuery]);

  const activeDoc = useMemo(() => documents.find(d => d.id === activeDocId) || documents[0], [documents, activeDocId]);

  const filteredReviewsList = useMemo(() => {
    if (!activeDoc.reviewsList) return [];
    if (!onlyShowVerifiedSameUniReviews) return activeDoc.reviewsList;
    const studentShort = (detectedInstitution?.shortCode || 'Technion').toLowerCase();
    return activeDoc.reviewsList.filter(rev => { const revUni = rev.university.toLowerCase(); return revUni.includes(studentShort) || studentShort.includes(revUni); });
  }, [activeDoc.reviewsList, onlyShowVerifiedSameUniReviews, detectedInstitution]);

  const handleEmailVerificationTest = (emailVal: string) => {
    setTestEmail(emailVal);
    setIsVerifyingEmail(true);

    const fallback = () => {
      const parsed = emailVal.toLowerCase().trim();
      const parts = parsed.split('@');
      if (parts.length === 2) {
        const domain = parts[1];
        if (domain.includes('technion.ac.il')) { setDetectedInstitution({ domain: 'technion.ac.il', institutionName: 'Technion - Israel Institute of Technology', country: 'IL', shortCode: 'TECHNION', iconAccent: '#0A2F44', verified: true }); setIsEmailVerified(true); }
        else if (domain.includes('tau.ac.il')) { setDetectedInstitution({ domain: 'tau.ac.il', institutionName: 'Tel Aviv University', country: 'IL', shortCode: 'TAU', iconAccent: '#1C6E8F', verified: true }); setIsEmailVerified(true); }
        else if (domain.includes('bgu.ac.il')) { setDetectedInstitution({ domain: 'bgu.ac.il', institutionName: 'Ben-Gurion University of the Negev', country: 'IL', shortCode: 'BGU', iconAccent: '#1a4c6e', verified: true }); setIsEmailVerified(true); }
        else if (domain.includes('mit.edu')) { setDetectedInstitution({ domain: 'mit.edu', institutionName: 'Massachusetts Institute of Technology', country: 'US', shortCode: 'MIT', iconAccent: '#DE3B2B', verified: true }); setIsEmailVerified(true); }
        else if (domain.includes('ox.ac.uk')) { setDetectedInstitution({ domain: 'ox.ac.uk', institutionName: 'University of Oxford', country: 'UK', shortCode: 'OXFORD', iconAccent: '#c0b9ac', verified: true }); setIsEmailVerified(true); }
        else { setDetectedInstitution({ domain, institutionName: 'External/Generic Email Domain', country: 'UNKNOWN', shortCode: 'GENERIC', iconAccent: '#999', verified: false }); setIsEmailVerified(false); }
      } else { setDetectedInstitution(null); setIsEmailVerified(false); }
      setIsVerifyingEmail(false);
    };

    const parsed = emailVal.toLowerCase().trim();
    if (parsed.split('@').length !== 2) {
      setDetectedInstitution(null);
      setIsEmailVerified(false);
      setIsVerifyingEmail(false);
      return;
    }

    checkEmailDomain(parsed)
      .then((route) => {
        if (!route) { fallback(); return; }
        setDetectedInstitution(route);
        setIsEmailVerified(route.verified);
        setIsVerifyingEmail(false);
      })
      .catch(() => fallback());
  };

  const executeSimulatedPurchase = (doc: DocumentItem) => {
    setSimulatePurchaseStatus('purchasing');
    setTimeout(() => {
      setPurchaseHistory(prev => [...prev, doc.id]);
      const sellerEarning = Math.round(doc.price * 0.7);
      setSellerLeaderboard(prev => ({ ...prev, [doc.authorName]: (prev[doc.authorName] || 0) + sellerEarning }));
      setBehaviorLogs(prev => [`[AUDIT] Purchased "${doc.title}" by ${doc.authorName}. ₪${doc.price} split: ₪${sellerEarning} (70% Seller), ₪${Math.round(doc.price * 0.3)} (30% Platform)`, ...prev]);
      setSimulatePurchaseStatus('success');
      setTimeout(() => setSimulatePurchaseStatus('idle'), 3000);
    }, 1200);
  };

  const executeSubmitReview = (docId: string, rating: number, rawText: string, author: string) => {
    const text = rawText.trim();
    if (!text) return;
    const finalAuthor = author.trim() || 'Daniel Alon';
    const updatedDocs = documents.map(doc => {
      if (doc.id === docId) {
        const currentReviewsList = doc.reviewsList || [];
        const newReview: DocumentReview = { id: `rev-${docId}-${Date.now()}`, authorName: finalAuthor, rating, text, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), university: detectedInstitution?.shortCode || 'Technion' };
        const updatedList = [newReview, ...currentReviewsList];
        const newCount = doc.reviewsCount + 1;
        const newAvgRating = ((doc.rating * doc.reviewsCount) + rating) / newCount;
        return { ...doc, rating: Number(newAvgRating.toFixed(2)), reviewsCount: newCount, reviewsList: updatedList };
      }
      return doc;
    });
    setDocuments(updatedDocs);
    setBehaviorLogs(prev => [`[REVIEW LOG] Student ${finalAuthor} rated "${activeDoc.title}" with ${rating} stars. System calculated new rating: ${((activeDoc.rating * activeDoc.reviewsCount + rating) / (activeDoc.reviewsCount + 1)).toFixed(2)}★.`, ...prev]);
    setNewReviewText('');
    setNewReviewRating(5);
  };

  const handleDisputeSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setDisputeStatus('submitted');
    const targetDoc = documents.find(d => d.id === disputeDocId);
    setBehaviorLogs(prev => [`[DISPUTE LOG] Buyer filed 7-day dispute for "${targetDoc?.title || disputeDocId}". Reason: "${disputeExplanation}". Placed on HOLD.`, ...prev]);
    showToast(`Your dispute for "${targetDoc?.title || disputeDocId}" has been submitted. Payout held for 7 days.`);
    setDisputeExplanation('');
  };

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestTitle || !newRequestCourse) return;
    setIsSubmittingRequest(true);
    setTimeout(() => {
      const item: RequestItem = { id: `req-${Date.now()}`, title: newRequestTitle, courseCode: newRequestCourse.toUpperCase(), university: newRequestUniv, bounty: newRequestBounty, deadline: 'In 7 days', bidsCount: 0, requester: 'MockStudent_Active', status: 'Open', terroir: `${newRequestUniv} Academic Course` };
      setRequests(prev => [item, ...prev]);
      setNewRequestTitle('');
      setNewRequestCourse('');
      setNewRequestBounty(50);
      setIsSubmittingRequest(false);
      setBehaviorLogs(prev => [`[REQUEST BOARD] Custom bounty set for "${item.title}" at ${item.university} - Bounty: ₪${item.bounty}`, ...prev]);
    }, 600);
  };

  const copyCodeToClipboard = (text: string) => { navigator.clipboard.writeText(text); setCopystate(true); setTimeout(() => setCopystate(false), 2000); };

  return (
    <div id="studymarket" data-theme={isDarkMode ? 'dark' : 'light'} className={`min-h-screen ${isDarkMode ? 'dark-mode bg-stone-950 text-stone-200' : 'bg-[#fcfcf9] text-[#1a2c3e]'} font-sans antialiased pb-24 selection:bg-[#1C6E8F] selection:text-white`}>
      
      <div className="bg-[#fff3e0] py-2 px-6 flex justify-between items-center text-[11px] font-medium text-[#b45f1b] border-b border-[#ffe9cc] select-none uppercase tracking-wider">
        <div className="flex items-center gap-1.5 font-mono"><Lock className="w-3.5 h-3.5 " /> <span>🔒 StudyMarket Confidential Business Draft — Pre-Seed Stage 1.0</span></div>
        <div className="hidden sm:flex items-center gap-4"><span>Primary Hub: Israel & Global Suffixes</span><span>Target Launch: Q3 2025</span></div>
      </div>

      {showStudyBanner && (
        <div className="bg-[#0f172a] text-stone-100 py-3 px-6 flex flex-col md:flex-row justify-between items-center text-xs border-b border-stone-850 select-none tracking-wide text-center md:text-left gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1C6E8F]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center gap-2.5 relative z-10">
            <span className="flex items-center gap-1 bg-[#1C6E8F] text-white text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded shadow-sm animate-bounce">🔥 MOED ALEF SEASON</span>
            <span className="font-semibold text-stone-200">Exam countdown: Moed Alef study season officially starts in <strong className="text-amber-400">18 days</strong>! Top premium summaries are trending 📈</span>
          </div>
          <div className="flex items-center gap-4 relative z-10 shrink-0">
            <div className="bg-stone-900/80 border border-stone-750 px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono text-[10px] text-amber-300">
              <span className="font-bold">18d</span>:<span className="font-bold">14h</span>:<span className="font-bold">25m</span>:<span className="font-bold animate-ping">●</span>
            </div>
            <button onClick={() => { setSortBy('Highest Rated'); showToast("Syllabus catalog sorted by Highest Rated Summaries! 📈"); }} className="bg-amber-400 hover:bg-amber-500 text-stone-950 font-black px-3 py-1 rounded text-[9px] uppercase shadow-xs cursor-pointer transition-all active:scale-95 shrink-0">Trending top rated summaries</button>
            <button onClick={() => setShowStudyBanner(false)} className="text-stone-400 hover:text-white shrink-0 font-bold p-1 cursor-pointer" title="Dismiss banner">✕</button>
          </div>
        </div>
      )}

      <header className="max-w-7xl mx-auto px-6 pt-10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#0A2F44] to-[#1C6E8F] bg-clip-text text-transparent">StudyMarket</h1>
            <span className="bg-[#eef2ff] px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#1C6E8F] uppercase tracking-wider">1.0 · MVP Preview</span>
          </div>
          <p className="text-sm text-stone-500 font-light mt-1.5 max-w-xl">The global peer-to-peer academic content marketplace. Verified student profiles. 70% revenue sharing. Machine-translated international curriculum equivalence.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="hidden md:flex bg-white border border-stone-200 rounded-full p-1.5 items-center gap-1.5 shadow-sm overflow-x-auto max-w-full">
            {(['marketplace', 'auth', 'strategic'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === tab ? 'bg-[#1C6E8F] text-white shadow-sm' : 'text-stone-500 hover:text-[#1c6e8f] hover:bg-stone-50'}`}>
                {tab === 'marketplace' ? 'Marketplace Portals' : tab === 'auth' ? 'Security & Trust' : 'Strategic Briefings'}
              </button>
            ))}
            {isTechnicalMode && <button onClick={() => setActiveTab('explorer')} className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === 'explorer' ? 'bg-[#1C6E8F] text-white shadow-sm' : 'text-stone-500 hover:text-[#1c6e8f] hover:bg-stone-50'}`}>Codebase Explorer</button>}
          </div>
          <button type="button" onClick={() => { const nextMode = !isDarkMode; setIsDarkMode(nextMode); setBehaviorLogs(prev => [`[STUDY DECK] Late-night study theme toggled. Mode loaded: ${nextMode ? "STONE DARK MODE 🌙" : "CLASSIC LIGHT MODE ☀️"}.`, ...prev]); }} title={isDarkMode ? "Switch to Day Mode" : "Switch to Late-night Study Mode"} className={`p-2.5 rounded-full border transition-all flex items-center justify-center shrink-0 shadow-xs cursor-pointer ${isDarkMode ? 'bg-stone-800 border-stone-700 text-amber-400 hover:bg-stone-700' : 'bg-white border-stone-200 text-stone-500 hover:text-[#1c6e8f] hover:bg-stone-50'}`}>
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-700" />}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ icon: <Coins className="w-5 h-5" />, label: 'Avg Payout Tier', value: '70% to Sellers' }, { icon: <Building className="w-5 h-5" />, label: 'Verification', value: '.ac.il & .edu Domains' }, { icon: <Sliders className="w-5 h-5" />, label: 'User Pricing Scale', value: '₪5 - ₪20 Single-Doc' }, { icon: <Globe className="w-5 h-5" />, label: 'Core Beachhead', value: 'Technion & TAU CS/EE' }].map((m, i) => (
          <div key={i} className="bg-[#F8FAFE] p-3.5 rounded-2xl border border-stone-200/60 flex items-center gap-3">
            <div className="bg-[#1C6E8F]/10 p-2 rounded-xl text-[#1C6E8F]">{m.icon}</div>
            <div><span className="text-[10px] text-stone-400 block font-mono uppercase">{m.label}</span><span className="text-sm font-bold text-[#0c3b4f]">{m.value}</span></div>
          </div>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-6">

        {activeTab === 'marketplace' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-[#1C6E8F]/5 border border-[#1C6E8F]/15 rounded-[24px] p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-600 animate-pulse"><Trophy className="w-5 h-5 text-amber-500 animate-bounce" /></div>
                  <div><h3 className="text-xs font-bold text-[#0c3b4f] uppercase tracking-wider font-sans">Top Verified Campus Earners 🎓</h3><p className="text-[11px] text-stone-500 font-light">Realized peer-to-peer payout activity from active campus authors</p></div>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  {Object.entries(sellerLeaderboard).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([name, goldNIS]) => {
                    let desc = "Verified Campus Creator"; let bg = "bg-stone-50/80 border-stone-200 text-stone-700";
                    const lower = name.toLowerCase();
                    if (lower.includes("sarah")) { desc = "Tel Aviv CS Scholar"; bg = "bg-indigo-50/80 border-indigo-200/70 text-indigo-950"; }
                    else if (lower.includes("amit")) { desc = "BGU Software Pilot"; bg = "bg-emerald-50/80 border-emerald-200/70 text-emerald-950"; }
                    else if (lower.includes("yossi")) { desc = "Technion EE Seller"; bg = "bg-sky-50/80 border-sky-200/70 text-sky-950"; }
                    else if (lower.includes("claire")) { desc = "Oxford Chemistry Peer"; bg = "bg-rose-50/80 border-rose-200/70 text-rose-950"; }
                    else if (lower.includes("john")) { desc = "MIT Economics Major"; bg = "bg-amber-50/80 border-amber-200/70 text-amber-950"; }
                    return (<div key={name} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-medium ${bg} shadow-2xs hover:scale-[1.02] transition-transform duration-200`}><span className="w-1.5 h-1.5 rounded-full bg-[#1C6E8F] shrink-0 animate-ping" /><span className="font-bold tracking-tight">{desc}</span><span className="font-mono bg-white/80 border border-stone-200/50 px-2 py-0.5 rounded text-[10px] font-black text-stone-900 block">₪{goldNIS.toLocaleString()} earned</span></div>);
                  })}
                </div>
              </div>

              <div className="bg-white p-5 rounded-[24px] border border-stone-200/80 shadow-xs flex flex-col gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input type="text" placeholder="Search by Siemens, Signals, CSE, course code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setTimeout(() => setSearchFocused(false), 200)} className="w-full bg-stone-50 pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-[#1C6E8F] focus:outline-none" />
                  {searchFocused && autocompleteSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl z-40 max-h-72 overflow-y-auto p-2 flex flex-col gap-1 select-none">
                      <div className="text-[9px] font-mono font-bold tracking-wider text-stone-400 uppercase px-2.5 py-1">✨ Syllabus Autocomplete Matches:</div>
                      {autocompleteSuggestions.map((doc) => (
                        <div key={doc.id} onMouseDown={(e) => e.preventDefault()} onClick={() => { setSearchQuery(doc.courseCode); setActiveDocId(doc.id); setShowDocPreviewModal(true); setSearchFocused(false); }} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 cursor-pointer transition-all border border-transparent hover:border-stone-100">
                          <div className="flex flex-col gap-0.5 text-left"><div className="text-xs font-bold text-[#1C6E8F] font-mono leading-none flex items-center gap-1.5"><span>{doc.courseCode}</span><span className="text-[8px] font-semibold px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">{doc.university}</span></div><span className="text-[11px] font-semibold text-stone-800 tracking-tight leading-normal mt-1">{doc.courseName}</span></div>
                          <div className="text-right text-[10px] text-stone-400 shrink-0 font-mono pl-2"><span className="font-medium text-stone-600">{doc.authorName}</span><span className="block text-[8px] text-amber-500 font-bold">★ {doc.rating.toFixed(1)}</span></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 w-full items-center justify-between border-t border-stone-100 pt-3.5">
                  <div className="flex flex-wrap gap-2.5 items-center">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-400 uppercase select-none">Filter:</div>
                    <select value={selectedUniversity} onChange={(e) => setSelectedUniversity(e.target.value)} className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-700 min-h-[44px] font-medium focus:outline-none focus:ring-2 focus:ring-[#1C6E8F]/25 cursor-pointer">
                      <option value="All">All Universities</option><option value="Technion — IIT">Technion</option><option value="Tel Aviv University">Tel Aviv Univ</option><option value="Ben-Gurion University">BGU</option><option value="MIT">MIT</option><option value="Oxford University">Oxford</option>
                    </select>
                    <select value={selectedDocType} onChange={(e) => setSelectedDocType(e.target.value)} className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1a2c3e] min-h-[44px] font-medium focus:outline-none focus:ring-2 focus:ring-[#1C6E8F]/25 cursor-pointer">
                      <option value="All">All Categories</option><option value="Past Exams with Worked Solutions">Exams & Solutions</option><option value="Full-Course Lecture Summaries">Lecture Summaries</option><option value="Multi-Page Finals Cheat Sheets">Finals Sheets</option><option value="Concept Maps & Visual Study Guides">Maps & Guides</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 bg-stone-50/70 py-2 px-4 rounded-xl border border-stone-200 text-xs w-full sm:w-auto min-h-[44px]">
                    <span className="text-[10px] font-mono font-bold text-stone-400 uppercase whitespace-nowrap">Price:</span>
                    <div className="flex flex-wrap items-center gap-4 w-full justify-between sm:justify-start">
                      <div className="flex items-center gap-2"><span className="text-[9px] font-mono text-stone-400">Min</span><input type="range" min="0" max="25" step="1" value={minPrice} onChange={(e) => { const val = Number(e.target.value); if (val <= maxPrice) setMinPrice(val); }} className="w-20 sm:w-28 md:w-32 h-6 py-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-[#1C6E8F]" /><span className="font-mono text-[10px] font-bold text-stone-600 min-w-[20px] text-right">₪{minPrice}</span></div>
                      <div className="flex items-center gap-2 border-l pl-3 border-stone-200"><span className="text-[9px] font-mono text-stone-400">Max</span><input type="range" min="0" max="25" step="1" value={maxPrice} onChange={(e) => { const val = Number(e.target.value); if (val >= minPrice) setMaxPrice(val); }} className="w-20 sm:w-28 md:w-32 h-6 py-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-[#1C6E8F]" /><span className="font-mono text-[10px] font-bold text-stone-700 min-w-[20px] text-right">₪{maxPrice}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-stone-400 uppercase select-none">Sort:</div>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-amber-50/80 border border-amber-300 text-amber-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold min-h-[44px] cursor-pointer focus:ring-2 focus:ring-amber-500/25 focus:outline-none">
                      <option value="Newest">Newest First</option><option value="Highest Rated">Highest Rated ★</option><option value="Most Popular">Most Popular ⚡</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocuments.length > 0 ? filteredDocuments.map((doc) => {
                  const isPurchased = purchaseHistory.includes(doc.id);
                  return (
                    <div key={doc.id} onClick={() => { setActiveDocId(doc.id); setShowDocPreviewModal(true); }} className={`bg-white border rounded-3xl p-5 cursor-pointer flex flex-col justify-between transition-all duration-300 group hover:shadow-md hover:border-stone-400 ${activeDocId === doc.id ? 'border-[#1C6E8F] ring-1 ring-[#1C6E8F]' : 'border-stone-200'}`}>
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="bg-[#eef2ff] px-2 py-0.5 rounded text-[9px] font-mono text-[#1c6e8f] font-semibold border border-indigo-100">{doc.university}</span>
                            <span className="bg-stone-50 text-stone-600 px-2 py-0.5 rounded text-[9px] font-mono font-medium border border-stone-200 flex items-center gap-1">{getDocTypeIcon(doc.docType)}<span className="max-w-[150px] truncate">{doc.docType}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={(e) => { e.stopPropagation(); toggleFollowDocument(doc.id); }} title={followedDocIds.includes(doc.id) ? "Following alerts" : "Follow document"} className={`p-1 rounded-md border transition-all ${followedDocIds.includes(doc.id) ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100 hover:text-amber-700' : 'bg-stone-50 border-stone-200 text-stone-400 hover:bg-stone-100 hover:text-stone-600'}`}>
                              {followedDocIds.includes(doc.id) ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5 opacity-60" />}
                            </button>
                            <span className="text-[#0f5b7a] font-extrabold text-sm whitespace-nowrap">₪{doc.price}</span>
                          </div>
                        </div>
                        <h3 className="text-base font-bold text-stone-900 mt-2.5 tracking-tight group-hover:text-[#1c6e8f] transition-colors leading-snug">{doc.title}</h3>
                        <div className="mt-2 text-stone-500 font-mono text-[11px] flex justify-between items-center flex-wrap gap-1">
                          <span>Syllabus: {doc.courseCode}</span>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setViewingSellerName(doc.authorName); }} className="text-stone-700 hover:text-[#1c6e8f] underline font-semibold transition-colors flex items-center gap-0.5 font-sans bg-transparent border-none p-0 cursor-pointer">👨‍🎓 {doc.authorName} {doc.authorVerified && <span className="text-emerald-500 text-[9px]">✓</span>}</button>
                          <span className="text-stone-400">{doc.semester}</span>
                        </div>
                        <div className="mt-3 text-xs text-stone-600 line-clamp-2 italic leading-relaxed">"{doc.previewPages[0].substring(0, 100)}..."</div>
                      </div>
                      <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                        <div className="flex flex-wrap items-center gap-2 text-stone-500"><span className="font-semibold text-amber-500 font-mono">★ {doc.rating.toFixed(1)}</span><span className="opacity-60">({doc.reviewsCount} reviews)</span><span className="text-stone-200">•</span><span className="text-[#1C6E8F] font-mono font-medium">⚡ {doc.downloads} downloads</span></div>
                        <span className="font-medium text-[#1C6E8F] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">{isPurchased ? 'View Doc (Paid) →' : 'Explore Preview →'}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-2 bg-white rounded-2xl py-12 text-center border border-dashed border-stone-300">
                    <p className="text-stone-400 text-sm">No direct documents match your active filter settings.</p>
                    <button onClick={() => { setSearchQuery(''); setSelectedUniversity('All'); setSelectedDocType('All'); }} className="mt-3 text-xs bg-[#1C6E8F] text-white px-4 py-2 rounded-full font-medium">Clear Active Filters</button>
                  </div>
                )}
              </div>

              <div className="bg-[#F8FAFE] rounded-3xl p-6 border border-[#e2edf7]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200 pb-4 mb-4">
                  <div>
                    <span className="text-[#b45f1b] bg-amber-50 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold border border-amber-100">Bounty Board</span>
                    <h2 className="text-xl font-bold text-[#0c3b4f] mt-1.5 tracking-tight">Commission Board (Request Content)</h2>
                    <p className="text-xs text-stone-500 font-light mt-0.5">Can't find solved solution maps? Post a guaranteed payment proposal. Verified students at the designated campus will be targeted.</p>
                  </div>
                  <HelpCircle className="w-5 h-5 text-stone-400 hidden sm:block" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <form onSubmit={handleAddRequest} className="bg-white p-4 rounded-2xl border border-stone-200/80 flex flex-col gap-3">
                    <span className="text-xs font-semibold text-[#0c3b4f] block border-b pb-1.5">Post Note Request</span>
                    <div><label className="text-[10px] font-mono text-stone-400 block uppercase">Request Title</label><input type="text" placeholder="e.g. Worked exams 2023 Moed B" value={newRequestTitle} onChange={(e) => setNewRequestTitle(e.target.value)} required className="w-full bg-stone-50 border border-stone-200 px-3.5 py-2.5 rounded-xl text-xs mt-1.5 min-h-[44px] focus:outline-[#1C6E8F]" /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-[10px] font-mono text-stone-400 block uppercase">Course Code</label><input type="text" placeholder="e.g. 046200" value={newRequestCourse} onChange={(e) => setNewRequestCourse(e.target.value)} required className="w-full bg-stone-50 border border-stone-200 px-3.5 py-2.5 rounded-xl text-xs mt-1.5 min-h-[44px] focus:outline-[#1C6E8F]" /></div>
                      <div><label className="text-[10px] font-mono text-stone-400 block uppercase">Bounty (₪)</label><input type="number" min="1" max="200" value={newRequestBounty} onChange={(e) => setNewRequestBounty(parseInt(e.target.value) || 0)} required className="w-full bg-stone-50 border border-stone-200 px-3.5 py-2.5 rounded-xl text-xs mt-1.5 min-h-[44px] focus:outline-[#1C6E8F]" /></div>
                    </div>
                    <div><label className="text-[10px] font-mono text-stone-400 block uppercase">Target University</label><select value={newRequestUniv} onChange={(e) => setNewRequestUniv(e.target.value)} className="w-full bg-stone-50 border border-stone-200 px-3.5 py-2.5 rounded-xl text-xs mt-1.5 min-h-[44px] cursor-pointer focus:outline-[#1C6E8F]"><option value="Technion — IIT">Technion</option><option value="Tel Aviv University">Tel Aviv Univ</option><option value="Ben-Gurion University">BGU</option></select></div>
                    <button type="submit" disabled={isSubmittingRequest} className="w-full bg-[#1C6E8F] text-white py-3 px-4 rounded-xl text-xs font-bold hover:bg-[#0c3b4f] transition-all flex items-center justify-center gap-1.5 mt-2 shadow-sm min-h-[44px] cursor-pointer border-0"><Plus className="w-4 h-4" /> {isSubmittingRequest ? 'Posting Bounty...' : 'Publish Bounty Offer'}</button>
                  </form>
                  <div className="md:col-span-2 flex flex-col gap-2.5 max-h-76 overflow-y-auto pr-1">
                    {requests.map((req) => {
                      const isMatch = documents.some(doc => doc.courseCode.trim().toLowerCase() === req.courseCode.trim().toLowerCase());
                      return (
                        <div key={req.id} className={`p-3.5 rounded-xl border flex justify-between items-center text-xs transition-all duration-300 ${isMatch ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/40 shadow-sm' : 'bg-white border-stone-200/80'}`}>
                          <div className="max-w-[70%]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${req.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{req.status.toUpperCase()}</span>
                              <span className="text-stone-500 font-mono text-[10px] font-semibold">{req.courseCode}</span>
                              {isMatch && <span className="bg-amber-100 text-[#b45f1b] border border-amber-300 text-[8px] font-mono font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">⚡ MATCH (₪ MONEY)</span>}
                            </div>
                            <h4 className="font-bold text-stone-900 mt-1 truncate">{req.title}</h4>
                            <p className="text-[10px] text-stone-400 mt-0.5">{req.university} • Posted by {req.requester}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[#0f5b7a] font-black text-sm block">₪{req.bounty}</span>
                            <span className="text-[10px] text-stone-400 block">{req.bidsCount} bids received</span>
                            {req.status === 'Open' && <button onClick={() => { setRequests(prev => prev.map(r => r.id === req.id ? {...r, status: 'Fulfill-In-Progress', bidsCount: r.bidsCount+1} : r)); showToast(`Placed a bid to fulfill request under ${req.courseCode}!`); }} className="mt-1 px-2.5 py-1 text-[9px] font-extrabold uppercase bg-stone-950 hover:bg-[#1C6E8F] text-white transition-all rounded shadow-xs cursor-pointer">Fulfill Brief →</button>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-white p-6 rounded-[32px] border border-stone-200/90 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.04] rounded-full -mr-8 -mt-8" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block">👑 Top Earners This Month</span>
                <h3 className="text-base font-bold text-stone-900 mt-1">Verified Creator Income Ledgers</h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed font-light">Direct student-author payouts distributed over secure Stripe vaults. Join 200+ campus authors.</p>
                <div className="mt-4 flex flex-col gap-3">
                  {Object.entries(sellerLeaderboard).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([name, goldNIS], idx) => {
                    let facultyText = "Technion EE seller"; let count = 42;
                    if (name.toLowerCase().includes("sarah")) { facultyText = "Tel Aviv CS scholar"; count = 54; }
                    else if (name.toLowerCase().includes("amit")) { facultyText = "BGU Software pilot"; count = 112; }
                    else if (name.toLowerCase().includes("claire")) { facultyText = "Oxford Chemistry peer"; count = 87; }
                    else if (name.toLowerCase().includes("yossi")) { facultyText = "Technion EE seller"; count = 145; }
                    else { facultyText = "Verified Campus Author"; count = 31; }
                    return (
                      <div key={name} className="flex justify-between items-center py-2.5 border-b border-stone-100 last:border-0 text-xs">
                        <div className="flex items-center gap-2 max-w-[70%] text-left"><span className="font-mono text-stone-400 font-bold text-xs select-none">0{idx + 1}</span><div className="truncate"><span className="font-bold text-stone-800 block text-xs truncate">{idx === 0 ? "👑 " : ""}{facultyText}</span><span className="text-[10px] text-stone-400 block font-light">Verified creator • {count} materials sold</span></div></div>
                        <span className="font-mono font-black text-[#1C6E8F] bg-[#1C6E8F]/5 px-2.5 py-1 rounded-lg text-xs">₪{goldNIS.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3.5 text-[10px] text-stone-400 text-center italic border-t border-stone-100 pt-2.5">Are you an exam ace? Upload documents to pocket 70% direct payouts.</div>
              </div>
              <div className="bg-[#0A2F44] text-white p-6 rounded-[28px]">
                <div className="flex justify-between items-start"><span className="text-[10px] tracking-widest uppercase opacity-60">StudyMarket pricing model</span><div className="w-6 h-6 border border-white/20 rounded-full flex items-center justify-center text-xs text-white/60">₪</div></div>
                <h4 className="text-xl font-light mt-3 leading-tight">StudyMarket Subscription Level</h4>
                <p className="text-xs text-white/70 leading-relaxed mt-2 font-light">Students can subscribe at <strong>₪29/month</strong> for unlimited PDF views of documents across all regional faculties.</p>
                <div className="mt-4 flex items-center justify-between text-xs font-mono font-semibold pt-3 border-t border-white/10 text-[#e6f2f7]"><span>REVENUE MODEL: STREAMING ROYALTY POOL</span><span className="underline">Specs Brief →</span></div>
              </div>
              <div className="bg-stone-50/80 p-5 rounded-[24px] border border-stone-200/60 text-xs text-stone-500">
                <span className="text-[9px] uppercase tracking-widest text-[#1c6e8f] font-bold block mb-3">Verified Buyer Reviews Model</span>
                <div className="flex flex-col gap-4">
                  <div><div className="flex items-center justify-between mb-1"><span className="font-bold text-stone-800">Or S. (Technion)</span><span className="text-[#1c6e8f] font-mono text-[10px]">★ 5.0 Rating</span></div><p className="italic leading-relaxed text-stone-600">"Lifesaver summary. The Signals series at our faculty is notoriously difficult but this worked answer sheet laid it out better than the standard syllabus tutorials."</p></div>
                  <div className="border-t border-stone-200/80 pt-3"><div className="flex items-center justify-between mb-1"><span className="font-bold text-stone-800">Liran M. (TAU)</span><span className="text-[#1c6e8f] font-mono text-[10px]">★ 4.8 Rating</span></div><p className="italic leading-relaxed text-stone-600">"Very good. The machine translation of the organic chemistry reaction maps from the original Oxford deck is flawless. Highly recommend."</p></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'auth' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 flex flex-col gap-6">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
                <div className="flex items-center gap-2 mb-3"><span className="bg-[#1C6E8F] text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">Layer 01</span><h3 className="text-lg font-bold text-stone-900 tracking-tight my-0">University Identity Detection (.ac.il, .edu, Suffix DNS Registry)</h3></div>
                <p className="text-xs text-stone-500 font-light leading-relaxed">Every user registers with their institutional email domain. StudyMarket's background suffix registry detects the exact university parameters instantly and grants verification badges. Enter an email below to test detection:</p>
                <div className="mt-4 flex gap-2 items-center">
                  <div className="relative flex-1"><Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" /><input type="text" value={testEmail} onChange={(e) => handleEmailVerificationTest(e.target.value)} placeholder="e.g. moti@student.tau.ac.il" className="w-full bg-stone-50 pl-10 pr-4 py-2 font-mono text-xs rounded-xl border border-stone-200 focus:outline-[#1C6E8F]" /></div>
                  {isVerifyingEmail && <RefreshCw className="w-5 h-5 text-stone-400 animate-spin" />}
                </div>
                {detectedInstitution && (
                  <div className="mt-4 p-4 rounded-xl border border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div><span className="text-[10px] uppercase font-mono text-stone-400 block">Identified Suffix System</span><h4 className="text-sm font-bold text-[#0c3b4f] mt-0.5">{detectedInstitution.institutionName}</h4><p className="text-[10px] text-stone-400 mt-0.5">DNS Suffix Match: <span className="font-mono text-[#1C6E8F] font-bold">{detectedInstitution.domain}</span></p></div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-xs">{detectedInstitution.verified ? <><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="text-xs font-semibold text-emerald-800 font-mono">{detectedInstitution.shortCode} VERIFIED</span></> : <><AlertTriangle className="w-4 h-4 text-amber-500" /><span className="text-xs font-semibold text-amber-800 font-mono">EXTERNAL DOMAIN</span></>}</div>
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-stone-100 flex gap-2 flex-wrap">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block w-full">Quick Suffix Presets:</span>
                  <button onClick={() => handleEmailVerificationTest('amit_cohen@campus.bgu.ac.il')} className="bg-stone-50 hover:bg-stone-100 border text-stone-600 px-2.5 py-1 rounded text-[11px] font-mono">@campus.bgu.ac.il</button>
                  <button onClick={() => handleEmailVerificationTest('prof_turing@cs.tau.ac.il')} className="bg-stone-50 hover:bg-stone-100 border text-stone-600 px-2.5 py-1 rounded text-[11px] font-mono">@cs.tau.ac.il</button>
                  <button onClick={() => handleEmailVerificationTest('alumni@ox.ac.uk')} className="bg-stone-50 hover:bg-stone-100 border text-stone-600 px-2.5 py-1 rounded text-[11px] font-mono">@ox.ac.uk</button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
                <div className="flex items-center gap-2 mb-3"><span className="bg-[#1C6E8F] text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">Layer 02</span><h3 className="text-lg font-bold text-stone-900 tracking-tight my-0">Financial KYC Verification (Required for Seller Withdrawals)</h3></div>
                <p className="text-xs text-stone-500 font-light leading-relaxed">Before a student can withdraw money earned from study summaries, they must complete financial KYC verification. This protects copyrights and prevents multi-accounting fraud.</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8FAFE] p-4 rounded-xl border border-[#e2edf7]">
                  <div><label className="text-[10px] font-mono text-stone-400 uppercase">Legal Full Name</label><input type="text" value={kycFullName} onChange={(e) => setKycFullName(e.target.value)} className="w-full bg-white border p-1 rounded text-xs mt-0.5 focus:outline-[#1C6E8F]" /></div>
                  <div><label className="text-[10px] font-mono text-stone-400 uppercase">Government ID Suffix/Number</label><input type="text" value={kycIdNumber} onChange={(e) => setKycIdNumber(e.target.value)} className="w-full bg-white border p-1 rounded text-xs mt-0.5 focus:outline-[#1C6E8F]" /></div>
                  <div><label className="text-[10px] font-mono text-stone-400 uppercase">Account Password</label><input type="password" value={kycPassword} onChange={(e) => setKycPassword(e.target.value)} className="w-full bg-white border p-1 rounded text-xs mt-0.5 focus:outline-[#1C6E8F]" /></div>
                  {registrationError && <div className="sm:col-span-2 text-[11px] text-red-600 font-mono bg-red-50 border border-red-200 rounded-lg px-2 py-1">{registrationError}</div>}
                  <div className="sm:col-span-2 pt-2 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500"><ShieldCheck className="w-4 h-4 text-[#1C6E8F]" /><span>ID files are stored with end-to-end sandbox AES-256 encryption.</span></div>
                    <button type="button" onClick={() => {
                      setKycStatus('processing');
                      setRegistrationError(null);
                      registerUser({ email: testEmail, name: kycFullName, password: kycPassword })
                        .then(({ status, data }) => {
                          if (status === 201) {
                            setKycStatus('approved');
                            setBehaviorLogs(prev => [`[KYC SUCCESS] ${data.message || 'Approved KYC verification for ' + kycFullName}`, ...prev]);
                          } else {
                            setKycStatus('failed');
                            setRegistrationError(data.error || 'Registration failed.');
                            setBehaviorLogs(prev => [`[KYC REJECTED] ${data.error || 'Unknown error'} (${testEmail})`, ...prev]);
                          }
                        })
                        .catch(() => {
                          setKycStatus('failed');
                          setRegistrationError('Could not reach auth-service. Is it running?');
                        });
                    }} className="bg-[#1c6e8f] text-white font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-[#0c3b4f] transition-all">{kycStatus === 'unsubmitted' && 'Submit Verification ID'}{kycStatus === 'processing' && 'Processing encrypted data...'}{kycStatus === 'approved' && 'KYC Approved Successfully ✓'}{kycStatus === 'failed' && 'Retry Submission'}</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="bg-[#0c0d10] text-[#00ff66] p-5 rounded-3xl border border-stone-800 font-mono text-[10px] select-none">
                <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />Layer 03: Behavioral Monitoring Audit</span><Terminal className="w-4 h-4 text-stone-500" /></div>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">{behaviorLogs.map((log, index) => (<div key={index} className="leading-relaxed border-b border-stone-900 pb-1.5 last:border-0"><span className="text-stone-500">{new Date().toLocaleTimeString()} &gt; </span>{log}</div>))}</div>
                <div className="mt-4 pt-2.5 border-t border-stone-800 flex justify-between items-center text-stone-400 text-[9px]"><span>DISPUTE TRIGGER: AUTO-DELIST RECENT &lt; 4.0</span><span className="text-emerald-500">ACTIVE LOGS</span></div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-stone-200">
                <h4 className="text-sm font-bold text-stone-900 tracking-tight mb-2 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /> Secure Dispute Resolution</h4>
                <p className="text-xs text-stone-500 font-light leading-relaxed mb-3">Is a purchased notebook inaccurate? Open a dispute. Funds remain on hold in Stripe's ledger escrow for 7 days to guarantee absolute academic fidelity.</p>
                <form onSubmit={handleDisputeSubmission} className="flex flex-col gap-4 text-xs">
                  <div><label className="text-[10px] font-mono uppercase text-stone-400 block tracking-wider font-semibold">Select Disputed Document</label><select value={disputeDocId} onChange={(e) => setDisputeDocId(e.target.value)} className="bg-stone-50 border border-stone-200 px-3.5 py-2.5 rounded-xl w-full mt-2 min-h-[44px] cursor-pointer text-stone-700">{documents.map(d => (<option key={d.id} value={d.id}>{d.title} (₪{d.price})</option>))}</select></div>
                  <div><label className="text-[10px] font-mono uppercase text-stone-400 block tracking-wider font-semibold">Explanation of Issue</label><textarea required placeholder="Explain what was inaccurate or missing..." value={disputeExplanation} onChange={(e) => setDisputeExplanation(e.target.value)} rows={3} className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl w-full mt-2 focus:outline-[#1C6E8F] text-stone-700" /></div>
                  <button type="submit" className="bg-stone-950 text-white font-bold py-3 px-4 rounded-xl text-xs hover:bg-[#1C6E8F] transition-all min-h-[44px] mt-2 cursor-pointer border-0 shadow-sm">Open Escrow Dispute</button>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'strategic' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 flex flex-col gap-6">
              <div className="bg-white p-6 rounded-3xl border border-stone-200">
                <h3 className="text-lg font-bold text-[#0c3b4f] border-b pb-2 mb-4 tracking-tight">1. StudyMarket Executive Concept Brief</h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-3">Every semester, hundreds of thousands of university students independently recreate identical study folders, exam keys, and laboratory reports, then discard them after finals. StudyMarket creates an organized directory framework to monetize this waste passively.</p>
                <p className="text-xs text-stone-600 leading-relaxed">Unlike anonymous drive directories, every document upload on StudyMarket carries an absolute structural signature of trust: seller domain authorization, composite reviews, and course code catalogs matched against physical syllabus boundaries.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 bg-[#F8FAFE] p-4 rounded-2xl border border-stone-100">
                  {[{ v: '₪5 - ₪20', l: 'Document Fee' }, { v: '70% Royalty', l: 'Direct Share' }, { v: '₪29/Month', l: 'Subscription Tier' }, { v: 'B2B License', l: 'Campus Access' }].map((m, i) => (<div key={i} className="text-center p-2 border-r last:border-0 border-stone-200/80"><span className="text-xs font-bold text-[#1C6E8F] block">{m.v}</span><span className="text-[9px] text-stone-400 uppercase font-mono block">{m.l}</span></div>))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-stone-200">
                <h3 className="text-lg font-bold text-[#0c3b4f] border-b pb-2 mb-4 tracking-tight">2. Strategic Evolution Roadmap</h3>
                <div className="relative border-l border-stone-200 ml-4 pl-6 flex flex-col gap-6">
                  {[
                    { phase: 'Phase 1 — Launch Beachhead (M1–M6)', title: 'Israel Academic Engine Focus', desc: 'Launch specialized engineering and computer science portals at the Technion, Tel Aviv University, and Ben-Gurion University. Establish critical content seed density through guaranteed student initiatives.', active: true },
                    { phase: 'Phase 2 — Multi-Faculty Integration (M6–M18)', title: 'Request Board Bounty & Subscription Models', desc: 'Activate the full Request Bounty systems publicly. Launch subscription pooling payout equations, and establish security controls alongside digital payment methods.', active: false },
                    { phase: 'Phase 3 — Translation Suffix Expansion (M18–M36)', title: 'UK & European High-Density Hubs', desc: 'Target UK, Germany, Netherlands, and Australian university suffixes. Activate AI learning translation protocols to dynamically convert localized summaries for international courses.', active: false },
                    { phase: 'Phase 4 — Global DNS scale (Y3+)', title: '4000+ Suffix Institutional Access Registry', desc: 'Deploy localized billing capabilities globally. Enable campus-wide B2B university dashboards and global equivalence schemas across continents.', active: false },
                  ].map((p, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white ${p.active ? 'bg-[#1C6E8F]' : 'bg-stone-300'}`} />
                      <span className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${p.active ? 'text-[#1C6E8F] bg-[#1C6E8F]/10' : 'text-stone-500 bg-stone-100'}`}>{p.phase}</span>
                      <h4 className="text-sm font-bold text-stone-900 mt-1">{p.title}</h4>
                      <p className="text-xs text-stone-500 font-light mt-0.5">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="bg-white p-5 rounded-3xl border border-stone-200">
                <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold block mb-3">Academic Risks & Guardrails</span>
                <div className="flex flex-col gap-4">
                  {[{ title: 'Academic Integrity Policies', risk: 'Universities may prohibit sharing course specific exams.', mitigation: 'Platform policy prohibits uploading active live answers. Focus purely on retrospective worked manuals.' }, { title: 'Content Quality Noise', risk: 'Diluted, useless spam documents ruin buyer confidence.', mitigation: 'Layer 3 behavioral scanning immediately hides files rated < 4.0 stars dynamically.' }, { title: 'Lecture Copyright Concerns', risk: 'Uploading official professor slides verbatim is a copyright breach.', mitigation: 'Prohibit verbatim slides. All documents must consist of original peer-annotated notes.' }].map((r, i) => (
                    <div key={i} className="border-b pb-3 last:border-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-950"><div className="w-1.5 h-1.5 bg-[#DE3B2B] rounded-full" />{r.title}</div>
                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed"><strong>Risk:</strong> {r.risk}<br /><strong>Mitigation:</strong> {r.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#eef2fc] border border-[#dce5f7] p-5 rounded-3xl text-xs text-stone-700">
                <span className="text-[9px] uppercase tracking-widest text-[#1c6e8f] font-bold block mb-1">Our Defensive Moat</span>
                <h5 className="font-bold text-stone-900 text-sm mb-1">Structured Content Graph</h5>
                <p className="leading-relaxed font-light">Once thousands of course summaries, solved exams, and reviews are anchored to specific professor syllabi and verified DNS email routes, the platform compounds. A competitor starting from scratch cannot match this database depth or reputation index.</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'explorer' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-stone-200">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1C6E8F] block">Repository Architecture</span>
              <h3 className="text-lg font-light tracking-tight text-stone-900 mt-0.5 mb-3">Source Workspace Directory</h3>
              <div className="font-mono text-xs flex flex-col gap-1.5">
                <div className="text-stone-400 block select-none">studymarket/</div>
                <div className="pl-3 text-[#1a2c3e]"><span className="text-stone-400">├──</span> apps/<div className="pl-6 text-stone-500 flex flex-col gap-1"><span>├── web/ <span className="opacity-40 italic text-[10px]">— Next.js Client Portals</span></span><span>└── mobile/ <span className="opacity-40 italic text-[10px]">— React Native Wrapper</span></span></div></div>
                <div className="pl-3 text-[#1a2c3e]"><span className="text-stone-400">├──</span> packages/<div className="pl-6 text-stone-500 flex flex-col gap-1"><span>├── ui/ <span className="opacity-30 italic text-[10px]">— Shared Components</span></span><span>├── types/ <span className="opacity-30 italic text-[10px]">— Shared Definitions</span></span><button onClick={() => setSelectedFileKey('UniversityRegistry.ts')} className={`text-left pl-4 font-semibold ${selectedFileKey === 'UniversityRegistry.ts' ? 'text-[#1C6E8F] underline' : 'text-stone-600 hover:text-black'}`}>└── utils/UniversityRegistry.ts</button><button onClick={() => setSelectedFileKey('FramerMotionThemes.ts')} className={`text-left pl-4 font-semibold ${selectedFileKey === 'FramerMotionThemes.ts' ? 'text-[#1C6E8F] underline' : 'text-stone-600 hover:text-black'}`}>└── ui/FramerMotionThemes.ts</button></div></div>
                <div className="pl-3 text-[#1a2c3e]"><span className="text-stone-400">├──</span> services/<div className="pl-6 text-stone-500 flex flex-col gap-1"><span>├── auth-service/ <span className="opacity-30 italic text-[10px]">— MFA, DNS Auth</span></span><span>├── content-service/ <span className="opacity-30 italic text-[10px]">— OCR Pdf processor</span></span><button onClick={() => setSelectedFileKey('StripePayment.ts')} className={`text-left pl-4 font-semibold ${selectedFileKey === 'StripePayment.ts' ? 'text-[#1C6E8F] underline' : 'text-stone-600 hover:text-black'}`}>└── payment-service/StripePayment.ts</button></div></div>
                <div className="pl-3 text-[#1a2c3e]"><span className="text-stone-400">└──</span> database/<button onClick={() => setSelectedFileKey('schema.prisma')} className={`text-left pl-6 font-semibold block ${selectedFileKey === 'schema.prisma' ? 'text-[#1C6E8F] underline' : 'text-stone-600 hover:text-black'}`}>└── schema.prisma</button></div>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-100 text-[11px] text-stone-500 font-light leading-relaxed"><span className="font-bold text-stone-800 block">Mono-Repo Note:</span>StudyMarket uses npm/pnpm workspaces to build multiple services independently, ensuring rapid deployment and isolated microservice schemas.</div>
            </div>
            <div className="lg:col-span-2 bg-[#0c0d10] text-[#00ff66] font-mono text-xs p-6 rounded-3xl border border-stone-800 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex justify-between items-center border-b border-stone-800 pb-3 mb-4 text-stone-400 text-[10px] select-none">
                  <div><span className="text-white font-bold block">{MONOREPO_FILES[selectedFileKey].path}</span><span className="text-[9px] text-stone-600 tracking-wider">WORKSPACE COMPILER FILE</span></div>
                  <button onClick={() => copyCodeToClipboard(MONOREPO_FILES[selectedFileKey].code)} className="hover:text-white flex items-center gap-1 transition-all">{copystate ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Plus className="w-3.5 h-3.5" />}{copystate ? 'COPIED ✓' : 'COPY FILE'}</button>
                </div>
                <p className="text-stone-400 text-[11px] italic mb-4 leading-relaxed bg-[#16181d] p-3 rounded-lg border border-stone-800 text-xs"><strong>Module Intent:</strong> {MONOREPO_FILES[selectedFileKey].description}</p>
                <pre className="max-h-96 overflow-y-auto overflow-x-auto text-stone-300 pr-2 leading-relaxed whitespace-pre font-mono text-[11px] select-text">{MONOREPO_FILES[selectedFileKey].code}</pre>
              </div>
              <div className="border-t border-stone-800 pt-3 mt-4 text-[9px] text-stone-500 uppercase flex justify-between select-none"><span>TSYNC INTEGRATED // MD5: TRUTH-38294</span><span className="text-emerald-500">Workspace OK</span></div>
            </div>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showDocPreviewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }} transition={{ type: 'spring', damping: 25, stiffness: 220 }} className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <button onClick={() => setShowDocPreviewModal(false)} className="absolute right-4 top-4 text-stone-400 hover:text-black cursor-pointer p-1"><Plus className="w-6 h-6 rotate-45" /></button>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2"><span className="bg-[#1C6E8F]/10 text-[#1C6E8F] text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-[#1c6e8f]/20 flex items-center gap-1">{getDocTypeIcon(activeDoc.docType)}<span>{activeDoc.docType}</span></span><span className="text-stone-400 text-[10px] font-mono">{activeDoc.university} • {activeDoc.courseCode}</span></div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-stone-900 mt-2">{activeDoc.title}</h2>
                  <p className="text-stone-500 text-xs font-light mt-0.5 flex items-center gap-1"><span>Authored by</span><button type="button" onClick={() => setViewingSellerName(activeDoc.authorName)} className="font-semibold text-stone-800 underline hover:text-[#1c6e8f] transition-all cursor-pointer bg-transparent border-none p-0 flex items-center gap-0.5 font-sans">{activeDoc.authorName} {activeDoc.authorVerified && <span className="text-emerald-500 font-bold">✓</span>}</button><span>({activeDoc.authorDegree})</span></p>
                </div>
                <div className="text-right"><span className="text-2xl font-extrabold text-[#0c3b4f] block">₪{activeDoc.price}</span><span className="text-[10px] font-bold block mt-0.5">{activeDoc.downloads} secure downloads</span></div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">📄 Academic Document First-Page Preview (Watermarked)</span><span className="bg-amber-100 text-amber-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">Page 1 Unlocked (Partial)</span></div>
                <div className="flex flex-col gap-3">
                  <div className="relative bg-white border border-stone-300 rounded-2xl p-6 shadow-xs overflow-hidden min-h-[280px]">
                    <div className="absolute inset-0 watermark-overlay opacity-30 select-none pointer-events-none animate-pulse" />
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-2 mb-4 font-mono text-[9px] text-[#1c6e8f]"><span className="font-extrabold uppercase tracking-wider">{activeDoc.university}</span><span className="font-medium text-stone-400">STUDYMARKET SECURED GATEWAY</span></div>
                    <div className="text-center pb-3 mb-4 border-b border-stone-100"><span className="text-[9px] font-mono font-bold tracking-widest text-[#b45f1b] bg-[#fff3e0] px-2 py-0.5 rounded uppercase inline-block mb-1.5">EXCLUSIVE STUDY NOTE CATALOG</span><h4 className="text-sm font-extrabold text-neutral-900 leading-tight">{activeDoc.courseCode} — {activeDoc.courseName}</h4><div className="text-[10px] text-stone-500 font-mono mt-0.5">Semester {activeDoc.semester} • Compiled by {activeDoc.authorName}</div></div>
                    <div className="space-y-3 relative z-10 text-[11px] leading-relaxed font-sans text-stone-800">
                      <div className="border-l-2 border-[#1c6e8f] pl-2.5"><strong className="text-stone-950 font-mono text-xs block">■ Core Formula Cheat Sheet and Lecture Bounds:</strong><p className="mt-1">"The response function h(t) is bounded by causal limitations. Thus, convolution satisfies y(t) = integral_0^t [ x(tau) * h(t - tau) d_tau ]. This simplifies to the following algebraic matrix formulation."</p></div>
                      <div className="border-l-2 border-[#1c6e8f] pl-2.5 mt-2"><strong className="text-stone-950 font-mono text-xs block">■ Sample Solution Explanatory Notes:</strong><p className="mt-1">"Tip: In Moed Alef exam cycles, professors always substitute values where z approaches 0. Compute residue by solving standard limit polynomial maps: lim(z→a) (z-a)F(z)."</p></div>
                      <div className="bg-amber-50/40 p-2 border border-amber-200/40 rounded-lg text-stone-700 italic">🔐 Snippet: "{activeDoc.previewPages[0].substring(0, 100)}..."</div>
                      <div className="relative mt-2 pt-2 border-t border-dashed border-stone-200">
                        <div className="space-y-2 opacity-25 filter blur-[3px] select-none pointer-events-none"><div className="pdf-mockup-line long" /><div className="pdf-mockup-line medium" /><div className="pdf-mockup-line short" /></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent flex flex-col items-center justify-center text-center p-3"><div className="p-1.5 bg-[#0c3b4f] rounded-full text-white inline-block mb-1 shadow-sm"><Lock className="w-3.5 h-3.5" /></div><span className="text-xs font-extrabold text-[#0c3b4f] block uppercase tracking-wider">Page 1 Preview Limit Reached</span><span className="text-[10px] text-stone-500 max-w-sm mt-0.5 leading-normal">Unlock full document fee (₪{activeDoc.price}) to instantly render the remaining custom pages without watermark restrictions.</span></div>
                      </div>
                    </div>
                    <div className="mt-4 pt-2 border-t border-stone-100 flex justify-between items-center text-[9px] text-stone-400 font-mono"><span>PAGE 1 OF {activeDoc.previewPages.length}</span><span>SECURE PREVIEW WATERMARK // TSYNC</span></div>
                  </div>
                  {activeDoc.previewPages.length > 1 && <div className="bg-stone-50/30 border border-dashed border-stone-200 rounded-2xl p-4 flex justify-between items-center text-[11px] text-stone-400 font-mono select-none pointer-events-none"><span>SHEET 2 OF {activeDoc.previewPages.length} [LOCKED]</span><span className="flex items-center gap-1 text-stone-500"><Lock className="w-3 h-3" /> Blur-encrypted till unlock</span></div>}
                </div>
              </div>
              <div className="mt-6 bg-[#f8fafe] p-4 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-bold tracking-wider text-[#1c6e8f] font-mono block uppercase">SIMULATION INTEGRATION // LAYER 2 SPLIT Payouts (70/30 SPLIT)</span>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-2.5">
                  <div className="text-xs text-stone-600 leading-snug">Pressing Purchase executes a 70/30 split logic:<div className="mt-1 font-mono text-[10px] text-stone-500">- Seller Royalty ({activeDoc.authorName}): <strong>₪{(activeDoc.price * 0.7).toFixed(1)}</strong><br/>- Platform Escrow fee: <strong>₪{(activeDoc.price * 0.3).toFixed(1)}</strong></div></div>
                  <button onClick={() => executeSimulatedPurchase(activeDoc)} disabled={simulatePurchaseStatus === 'purchasing' || purchaseHistory.includes(activeDoc.id)} className="w-full sm:w-auto bg-[#1C6E8F] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0c3b4f] transition-all whitespace-nowrap self-stretch flex items-center justify-center gap-1.5 shadow-sm">{simulatePurchaseStatus === 'idle' && !purchaseHistory.includes(activeDoc.id) && `Purchase Document (₪${activeDoc.price})`}{simulatePurchaseStatus === 'purchasing' && 'Executing Split Stripe Payment...'}{purchaseHistory.includes(activeDoc.id) && '✓ Purchased (Access Unlocked)'}</button>
                </div>
                {purchaseHistory.includes(activeDoc.id) && <div className="mt-3 bg-emerald-50 text-emerald-800 p-2 rounded-lg text-xs flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /><span>Purchase completed! <strong>70% share (₪{(activeDoc.price * 0.7).toFixed(1)})</strong> was routed to {activeDoc.authorName}'s wallet ledger.</span></div>}
              </div>
              <div className="mt-6 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex-1"><span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 font-mono block">🔔 Document Alerts & Updates Tracker</span><p className="text-[11px] text-amber-900/80 leading-normal mt-1">{followedDocIds.includes(activeDoc.id) ? "✓ Currently Following! You will receive notification logs if this document's price drops or is updated." : "Get notified via behavior log and toast notice if this document gets updated or its price decreases."}</p></div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); toggleFollowDocument(activeDoc.id); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs ${followedDocIds.includes(activeDoc.id) ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-white border text-amber-800 border-amber-300 hover:bg-amber-100/50'}`}>{followedDocIds.includes(activeDoc.id) ? <><Bell className="w-3.5 h-3.5 text-white" /><span>Following Alerts</span></> : <><BellOff className="w-3.5 h-3.5 text-amber-800/80" /><span>Follow Document</span></>}</button>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-200/50 flex flex-wrap gap-2">
                  <span className="text-[9px] font-mono text-amber-800 uppercase block w-full mb-1">💡 Simulator (Test alerts by triggering doc events below):</span>
                  <button type="button" onClick={() => handleSimulatePriceDrop(activeDoc.id)} className="bg-white/85 hover:bg-white text-[#1a2c3e] border border-amber-200 py-1.5 px-3 rounded-lg text-[10px] font-mono shadow-xs transition-all flex items-center gap-1"><TrendingUp className="w-3 h-3 text-red-500" style={{ transform: 'rotate(180deg)' }} /><span>Trigger ₪5 Price Drop</span></button>
                  <button type="button" onClick={() => handleSimulateFileUpdate(activeDoc.id)} className="bg-white/85 hover:bg-white text-[#1a2c3e] border border-amber-200 py-1.5 px-3 rounded-lg text-[10px] font-mono shadow-xs transition-all flex items-center gap-1"><RefreshCw className="w-3 h-3 text-[#1C6E8F]" /><span>Trigger Material Update</span></button>
                </div>
              </div>
              <div className="mt-6 border-t border-stone-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div><h3 className="text-sm font-bold text-stone-900 tracking-tight">Verified Student Reviews ({activeDoc.reviewsCount})</h3><p className="text-[11px] text-stone-400 font-light mt-0.5">Only verified buyers who paid ₪{activeDoc.price} can rate this material.</p></div>
                  <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 text-amber-700 font-mono text-[11px] font-bold"><span>★ {activeDoc.rating.toFixed(2)}</span></div>
                </div>
                <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-2xl mb-4 text-left">
                  <div className="flex items-center gap-2"><input type="checkbox" id="verified-uni-filter-preview" checked={onlyShowVerifiedSameUniReviews} onChange={(e) => setOnlyShowVerifiedSameUniReviews(e.target.checked)} className="cursor-pointer accent-[#1C6E8F] w-4 h-4 rounded" /><label htmlFor="verified-uni-filter-preview" className="font-semibold text-stone-700 cursor-pointer select-none text-xs">🎓 Only show reviews from verified <span className="text-[#1C6E8F] font-bold">{detectedInstitution?.shortCode || 'Technion'}</span> students</label></div>
                </div>
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto mb-4 pr-1">
                  {filteredReviewsList && filteredReviewsList.length > 0 ? filteredReviewsList.map((rev) => (
                    <div key={rev.id} className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 text-xs">
                      <div className="flex justify-between items-start"><div><span className="font-bold text-stone-800">{rev.authorName}</span><span className="text-stone-400 font-light ml-1.5 font-mono text-[10px]">({rev.university})</span></div><div className="flex items-center gap-1 font-mono text-[10px] text-amber-500 font-semibold bg-white px-1.5 py-0.5 rounded border border-amber-100"><span>★ {Number(rev.rating).toFixed(1)}</span></div></div>
                      <p className="text-stone-600 mt-1.5 leading-relaxed font-serif italic">"{rev.text}"</p>
                      <div className="text-[9px] text-stone-400 text-right mt-1 font-mono">{rev.date}</div>
                    </div>
                  )) : <div className="text-center py-6 bg-stone-50 border border-dashed rounded-xl text-stone-400 text-xs font-light">No matching verified reviews found for {detectedInstitution?.shortCode || 'Technion'}. Check general reviews by toggling filter!</div>}
                </div>
                {purchaseHistory.includes(activeDoc.id) ? (
                  <div className="bg-stone-50/50 p-4 rounded-2xl border border-[#1c6e8f]/30 mt-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#1c6e8f] block mb-2 font-mono">🔒 Verified Buyer: Write a Review</span>
                    <div className="flex flex-col gap-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className="text-[10px] font-mono text-stone-400 block uppercase mb-1">Your Name</label><input type="text" placeholder="e.g. Daniel Alon" value={newReviewAuthor} onChange={(e) => setNewReviewAuthor(e.target.value)} className="bg-white border text-xs p-2 rounded-lg w-full focus:outline-[#1C6E8F]" /></div>
                        <div><label className="text-[10px] font-mono text-stone-400 block uppercase mb-1">Select Star Rating</label><div className="flex items-center gap-1 mt-1">{[1,2,3,4,5].map((starValue) => (<button key={starValue} type="button" onClick={() => setNewReviewRating(starValue)} className="focus:outline-none transition-transform active:scale-95 bg-transparent border-0"><span className={`text-xl select-none cursor-pointer ${newReviewRating >= starValue ? 'text-amber-400' : 'text-stone-300'}`}>★</span></button>))}<span className="ml-2 font-mono text-xs font-bold text-stone-600">({newReviewRating}.0 / 5.0)</span></div></div>
                      </div>
                      <div><label className="text-[10px] font-mono text-stone-400 block uppercase mb-1">Written Feedback</label><textarea placeholder="What did you think of these syllabus notes / exam guides? Be specific..." value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} rows={2} className="bg-white border p-2 rounded-lg w-full focus:outline-[#1C6E8F] text-xs leading-relaxed" /></div>
                      <div className="flex justify-end"><button type="button" onClick={() => { if (!newReviewText.trim()) { alert('Please write a review text before submitting.'); return; } executeSubmitReview(activeDoc.id, newReviewRating, newReviewText, newReviewAuthor); }} className="bg-[#1C6E8F] text-white font-bold py-2 px-5 rounded-xl text-xs hover:bg-[#0c3b4f] transition-all shadow-sm">Submit Verified Review & Rating</button></div>
                    </div>
                  </div>
                ) : <div className="bg-stone-50 p-3 rounded-xl border text-center text-[11px] text-stone-400 font-light mt-1.5 flex items-center justify-center gap-1"><Lock className="w-3.5 h-3.5" /><span>Purchase this document to post a rating and leave written student reviews. Fee: ₪{activeDoc.price}.</span></div>}
              </div>
              <div className="mt-6 flex justify-end gap-3 text-xs"><button type="button" onClick={() => setShowDocPreviewModal(false)} className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl font-medium">Close Folder Preview</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-16 border-t border-stone-200 pt-10 pb-16 max-w-7xl mx-auto px-6 text-center text-xs text-stone-400 font-light">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6"><p className="uppercase tracking-widest text-[#0c3b4f]/75 font-mono">STUDYMARKET © {new Date().getFullYear()} — UNIVERSAL EDUCATION EQUIVALENCY SYSTEM.</p><div className="flex gap-6 font-mono text-[10px]"><span className="hover:text-black hover:underline cursor-pointer">TERMS OF DISPUTE</span><span className="hover:text-black hover:underline cursor-pointer">UNIVERSITY REGISTRY Suffix</span><span className="hover:text-black hover:underline cursor-pointer">STRIPE split CONNECT</span></div></div>
        <p className="max-w-2xl mx-auto text-[11px] leading-relaxed opacity-80">This peer-to-peer portal operates with mandatory DNS institution matching for Layer 1. Pay-per-document payouts adhere strictly to financial KYC and are held in split-escrow ledger configurations to maintain copyright trust.</p>
      </footer>

      <div className="fixed bottom-6 right-6 z-[99] flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>{toasts.map((t) => (<motion.div key={t.id} initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="pointer-events-auto bg-[#0c3b4f]/95 text-white p-4 rounded-2xl border border-amber-300/40 flex items-center justify-between gap-3 shadow-2xl"><div className="flex items-center gap-3"><span className="p-2 bg-amber-500 rounded-xl text-stone-900 inline-block shadow-inner shrink-0 w-8 h-8 flex items-center justify-center"><Bell className="w-4 h-4 text-stone-950 animate-bounce" /></span><div><span className="text-[10px] uppercase font-mono text-amber-300 font-bold block leading-none">SYSTEM ALERT</span><p className="text-xs font-semibold leading-snug mt-1 font-sans">{t.message}</p></div></div><button type="button" onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))} className="text-white/60 hover:text-white ml-2 text-xs font-extrabold focus:outline-none p-1 cursor-pointer bg-transparent border-0">✕</button></motion.div>))}</AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-2 py-2 flex justify-around items-center shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        {(['marketplace', 'auth', 'strategic'] as const).map((tab) => {
          const icons: Record<string, React.ReactNode> = { marketplace: <BookOpen className="w-5 h-5" />, auth: <ShieldCheck className="w-5 h-5" />, strategic: <FileText className="w-5 h-5" /> };
          const labels: Record<string, string> = { marketplace: 'Catalog', auth: 'Security', strategic: 'Briefings' };
          return <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${activeTab === tab ? 'text-[#1C6E8F] scale-105 font-bold' : 'text-stone-400'}`}>{icons[tab]}<span className="text-[10px] font-sans mt-0.5 font-semibold">{labels[tab]}</span></button>;
        })}
        {isTechnicalMode && <button onClick={() => setActiveTab('explorer')} className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${activeTab === 'explorer' ? 'text-[#1C6E8F] scale-105 font-bold' : 'text-stone-400'}`}><Terminal className="w-5 h-5" /><span className="text-[10px] font-sans mt-0.5 font-semibold">Explorer</span></button>}
      </div>

      <AnimatePresence>
        {viewingSellerName && (() => {
          const sellerDocs = documents.filter(d => d.authorName.toLowerCase() === viewingSellerName.toLowerCase());
          const totalSellerDownloads = sellerDocs.reduce((sum, d) => sum + d.downloads, 0);
          const averageSellerRating = sellerDocs.length > 0 ? sellerDocs.reduce((sum, d) => sum + d.rating, 0) / sellerDocs.length : 4.9;
          const isVerifiedSeller = sellerDocs.some(d => d.authorVerified) || viewingSellerName === 'Yossi G.';
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0c3b4f]/80 backdrop-blur-md z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 220 }} className="bg-white rounded-t-3xl sm:rounded-3xl border border-stone-200 p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl pb-12 sm:pb-6">
                <div className="flex justify-between items-start gap-4 border-b border-stone-100 pb-4 mb-4">
                  <div className="flex items-center gap-3"><div className="w-12 h-12 bg-[#1C6E8F]/10 rounded-2xl flex items-center justify-center text-xl font-bold text-[#1C6E8F]">{viewingSellerName.charAt(0)}</div><div><div className="flex items-center gap-1.5 flex-wrap"><h2 className="text-lg font-black text-stone-900 tracking-tight">{viewingSellerName}</h2>{isVerifiedSeller && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> VERIFIED SELLER</span>}</div><p className="text-xs text-[#1C6E8F] font-mono leading-none mt-1">Alumnus Faculty Suffix: ac.il/grad</p></div></div>
                  <button onClick={() => setViewingSellerName(null)} className="bg-stone-50 hover:bg-stone-100 rounded-full p-1.5 text-stone-400 hover:text-black cursor-pointer bg-transparent border-0"><Plus className="w-6 h-6 rotate-45" /></button>
                </div>
                <div className="grid grid-cols-3 gap-3 bg-stone-50 p-4 rounded-2xl border mb-6 text-center">
                  <div><span className="text-[10px] font-mono uppercase text-stone-400 block font-bold">Total Catalog</span><span className="text-xs font-extrabold text-stone-850 mt-1 block">{sellerDocs.length} items</span></div>
                  <div><span className="text-[10px] font-mono uppercase text-stone-400 block font-bold">gross earnings</span><span className="text-xs font-extrabold text-[#1C6E8F] mt-1 block">₪{(totalSellerDownloads * 18).toLocaleString()} ({totalSellerDownloads} sold)</span></div>
                  <div><span className="text-[10px] font-mono uppercase text-[#b45f1b] block font-bold">Reputation</span><span className="text-xs font-extrabold text-[#b45f1b] mt-1 block">★ {averageSellerRating.toFixed(2)} / 5.0</span></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-3">PUBLISHED ACADEMIC SYLLABI & LECTURE LOGS ({sellerDocs.length})</span>
                <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                  {sellerDocs.map((doc) => (
                    <div key={doc.id} onClick={() => { setActiveDocId(doc.id); setShowDocPreviewModal(true); setViewingSellerName(null); }} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 hover:border-[#1C6E8F] hover:bg-white cursor-pointer transition-all flex justify-between items-start text-xs group">
                      <div className="max-w-[75%]"><div className="flex items-center gap-1.5 flex-wrap"><span className="text-[8px] bg-sky-100 border border-sky-200 px-1.5 py-0.2 rounded uppercase tracking-wide font-mono font-bold text-[#1a5f7a]">{doc.docType}</span><span className="text-stone-500 font-mono text-[9px] font-semibold">{doc.courseCode}</span></div><h4 className="font-bold text-stone-950 group-hover:text-[#1c6e8f] transition-all mt-1 truncate">{doc.title}</h4><p className="text-[10px] text-stone-400 mt-0.5 truncate">{doc.university} • {doc.courseName}</p></div>
                      <div className="text-right shrink-0"><span className="text-[#0c3b4f] font-mono font-extrabold block">₪{doc.price}</span><span className="text-[9px] text-[#2e7d32] bg-emerald-50 px-1 rounded block mt-1 font-mono font-bold">★ {doc.rating.toFixed(2)}</span></div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between items-center text-xs border-t pt-4"><span className="text-[10px] text-stone-400 font-mono">StudyMarket Peer Ledger sync active ✔</span><button onClick={() => setViewingSellerName(null)} className="bg-stone-900 text-white hover:bg-stone-800 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer border-0 shadow-sm">Close Directory View</button></div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {showOnboarding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0c3b4f]/80 backdrop-blur-md z-[80] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }} className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 max-w-lg w-full shadow-2xl relative">
              <button onClick={() => setShowOnboarding(false)} className="absolute right-4 top-4 text-stone-400 hover:text-black cursor-pointer p-1 bg-transparent border-0" title="Skip Onboarding"><Plus className="w-6 h-6 rotate-45" /></button>
              <div className="text-center"><span className="p-3 bg-[#1C6E8F]/10 rounded-2xl text-[#1C6E8F] inline-block mb-3"><Sparkles className="w-6 h-6 animate-pulse" /></span><h2 className="text-xl font-black text-stone-900 tracking-tight">Configure Your Campus Hub</h2><p className="text-xs text-stone-500 font-light mt-1 max-w-xs mx-auto leading-normal">Customize StudyMarket to instantly focus your directory feed on your university's syllabi and departments.</p></div>
              <div className="mt-6 flex flex-col gap-4 text-left">
                <div><label className="text-[10px] font-mono font-bold text-[#1C6E8F] block uppercase tracking-wider mb-1.5">1. SELECT ACTIVE INSTITUTION PORTAL:</label><div className="grid grid-cols-2 gap-2">{[{ name: 'Technion — IIT', label: 'Technion ⚙️' }, { name: 'Tel Aviv University', label: 'TAU 🏛️' }, { name: 'Ben-Gurion University', label: 'BGU 🌵' }, { name: 'Oxford University', label: 'Oxford 👑' }].map((univ) => (<button key={univ.name} type="button" onClick={() => setSelectedUniversity(univ.name)} className={`py-3 px-4 min-h-[44px] rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${selectedUniversity === univ.name ? 'bg-[#1C6E8F] border-[#1C6E8F] text-white shadow-md' : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'}`}>{univ.label}</button>))}</div></div>
                <div><label className="text-[10px] font-mono font-bold text-[#1C6E8F] block uppercase tracking-wider mb-1.5">2. ACTIVE STUDY TRACK:</label><select value={selectedDocType} onChange={(e) => setSelectedDocType(e.target.value)} className="w-full bg-stone-50 border border-stone-200 px-3.5 py-3 rounded-xl text-xs font-semibold min-h-[44px] focus:outline-[#1C6E8F] cursor-pointer"><option value="All">All Study Formats</option><option value="Past Exams with Worked Solutions">Past Exams & Solutions</option><option value="Full-Course Lecture Summaries">Full Lecture Summaries</option><option value="Multi-Page Finals Cheat Sheets">Finals Cheat Sheets</option></select></div>
              </div>
              <div className="mt-8 flex flex-col gap-3"><button type="button" onClick={() => { setShowOnboarding(false); showToast(`🚀 Study portal loaded for ${selectedUniversity}!`); setBehaviorLogs(prev => [`[ONBOARDING] Match sequence completed successfully for ${selectedUniversity} student. Loaded customized syllabus view grid.`, ...prev]); }} className="w-full bg-[#1C6E8F] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#0c3b4f] transition-all flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider cursor-pointer border-0">Configure My StudyMarket Feed 🚀</button><button type="button" onClick={() => setShowOnboarding(false)} className="text-[11px] text-stone-400 hover:text-stone-600 font-mono text-center cursor-pointer bg-transparent border-0">Skip configuration (Browse all globally)</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
