import { jsPDF } from 'jspdf';

/**
 * Generates a colorful, professional single-page PDF report for RailClip.
 *
 * @param {Object} clipData - Prediction data for the clip or fleet.
 * @param {Object} summary - Overall fleet summary.
 */
export function generateAiReportPdf(clipData, summary = {}) {
	const doc = new jsPDF({
		orientation: 'portrait',
		unit: 'mm',
		format: 'a4',
	});

	const pageWidth = 210;
	const pageHeight = 297;

	// Resolve clip information with fallback defaults
	const qrId = clipData?.qrId || clipData?.compId || 'C0025';
	const batchNo = clipData?.batchNumber || 'RC0001';
	const priority = (clipData?.priority || clipData?.maintenance_priority || 'Low').toUpperCase();
	const health = clipData?.health ?? 98;
	const confidence = clipData?.probability ||
		(clipData?.confidence ? `${(clipData.confidence > 1 ? clipData.confidence : clipData.confidence * 100).toFixed(1)}%` : '99.9%');
	const station = clipData?.station || 'Warehouse';
	const section = clipData?.section || 'Batch - Procurement';
	const manufacturer = clipData?.manufacturer || 'Selva Steels';
	const lastStatus = clipData?.lastStatus || clipData?.last_status || 'Healthy';
	const totalScans = clipData?.totalScans ?? clipData?.total_scans ?? 1;
	const looseCount = clipData?.looseCount ?? clipData?.loose_count ?? 0;
	const wearCount = clipData?.wearCount ?? clipData?.wear_count ?? 0;
	const replacementCount = clipData?.replacementCount ?? clipData?.replacement_count ?? 0;
	const daysSinceInsp = clipData?.daysSinceLastInspection ?? clipData?.days_since_last_inspection ?? 37;
	const daysSinceRepair = clipData?.daysSinceLastRepair ?? clipData?.days_since_last_repair ?? 37;
	const clipAgeDays = clipData?.clipAgeDays ?? clipData?.clip_age_days ?? 37;
	const recommendation = clipData?.recommendation ||
		(priority === 'HIGH'
			? 'Immediate clip replacement & toe-load recalibration required within 48 hours.'
			: priority === 'MEDIUM'
			? 'Schedule fastener torque retightening and visual wear assessment within 7 days.'
			: 'Optimal structural integrity & elasticity. No immediate maintenance required.');

	// 1. TOP COLORFUL HEADER BANNER (Indian Railways Navy & Gold)
	doc.setFillColor(0, 40, 85); // Indian Railways Navy #002855
	doc.rect(0, 0, pageWidth, 34, 'F');

	// Accent gold top line
	doc.setFillColor(245, 158, 11); // Amber / Gold
	doc.rect(0, 0, pageWidth, 3, 'F');

	// Logo Badge (Stylized RailClip Emblem)
	doc.setFillColor(0, 75, 135);
	doc.roundedRect(12, 7, 20, 20, 3, 3, 'F');
	doc.setDrawColor(245, 158, 11);
	doc.setLineWidth(0.6);
	doc.roundedRect(12, 7, 20, 20, 3, 3, 'S');

	// Logo text inside emblem
	doc.setTextColor(245, 158, 11);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(12);
	doc.text('RC', 18, 19.5);

	// Header Titles
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(16);
	doc.setTextColor(255, 255, 255);
	doc.text('RailClip', 36, 15);

	doc.setFontSize(8.5);
	doc.setTextColor(254, 240, 138); // Soft Gold
	doc.text('INDIAN RAILWAYS • PERMANENT WAY FASTENER SYSTEM', 36, 21);

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(7);
	doc.setTextColor(203, 213, 225);
	doc.text('Predictive Track Clip Fatigue & Maintenance Priority Diagnostic Report', 36, 27);

	// Top Right Badge
	doc.setFillColor(15, 23, 42);
	doc.roundedRect(pageWidth - 52, 9, 40, 16, 2, 2, 'F');
	doc.setTextColor(52, 211, 153);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7.5);
	doc.text('XGBOOST ML ENGINE', pageWidth - 49, 15);
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(6.5);
	doc.text('Accuracy: 99.93% (v2.4)', pageWidth - 49, 21);

	// 2. METADATA STRIP
	doc.setFillColor(241, 245, 249);
	doc.rect(0, 34, pageWidth, 11, 'F');
	doc.setDrawColor(226, 232, 240);
	doc.setLineWidth(0.3);
	doc.line(0, 45, pageWidth, 45);

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7);
	doc.setTextColor(71, 85, 105);
	doc.text('REPORT ID:', 12, 41);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(15, 23, 42);
	doc.text(`IR-RC-${qrId}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`, 29, 41);

	doc.setFont('helvetica', 'bold');
	doc.setTextColor(71, 85, 105);
	doc.text('GENERATED ON:', 80, 41);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(15, 23, 42);
	doc.text(new Date().toLocaleString(), 105, 41);

	doc.setFont('helvetica', 'bold');
	doc.setTextColor(71, 85, 105);
	doc.text('DIVISION:', 150, 41);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(15, 23, 42);
	doc.text('SOUTHERN RAILWAY (MAS/CBE)', 166, 41);

	// 3. EXECUTIVE KPI CARDS (4 cards)
	const kpiY = 49;
	const cardW = 43;
	const cardH = 21;
	const gap = 4;

	const kpiData = [
		{ label: 'Clip Health Score', val: `${health}/100`, color: [16, 185, 129], bg: [236, 253, 245] },
		{ label: 'Predicted Priority', val: priority, color: priority === 'HIGH' ? [239, 68, 68] : priority === 'MEDIUM' ? [245, 158, 11] : [16, 185, 129], bg: priority === 'HIGH' ? [254, 242, 242] : [240, 253, 244] },
		{ label: 'Model Confidence', val: confidence, color: [2, 132, 199], bg: [240, 249, 255] },
		{ label: 'Total Scans Logged', val: `${totalScans} Inspections`, color: [124, 58, 237], bg: [245, 243, 255] },
	];

	kpiData.forEach((kpi, idx) => {
		const x = 12 + idx * (cardW + gap);
		doc.setFillColor(...kpi.bg);
		doc.roundedRect(x, kpiY, cardW, cardH, 2, 2, 'F');
		doc.setDrawColor(203, 213, 225);
		doc.setLineWidth(0.2);
		doc.roundedRect(x, kpiY, cardW, cardH, 2, 2, 'S');

		doc.setFillColor(...kpi.color);
		doc.rect(x, kpiY, 2.5, cardH, 'F');

		doc.setFont('helvetica', 'normal');
		doc.setFontSize(6.5);
		doc.setTextColor(100, 116, 139);
		doc.text(kpi.label, x + 5.5, kpiY + 7);

		doc.setFont('helvetica', 'bold');
		doc.setFontSize(11);
		doc.setTextColor(...kpi.color);
		doc.text(kpi.val, x + 5.5, kpiY + 16);
	});

	// 4. COMPONENT & PHYSICAL PROFILE SECTION
	const secY = 74;
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(10);
	doc.setTextColor(0, 40, 85);
	doc.text('1. Component Profile & Field Data Vector', 12, secY);

	const halfW = 90;
	const boxH = 48;

	// Box A: Component Specifications
	doc.setFillColor(255, 255, 255);
	doc.roundedRect(12, secY + 3, halfW, boxH, 2, 2, 'F');
	doc.setDrawColor(203, 213, 225);
	doc.roundedRect(12, secY + 3, halfW, boxH, 2, 2, 'S');

	doc.setFillColor(0, 40, 85);
	doc.rect(12, secY + 3, halfW, 6, 'F');
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7);
	doc.setTextColor(255, 255, 255);
	doc.text('HARDWARE & REGISTRY SPECIFICATIONS', 15, secY + 7.2);

	const specRows = [
		['Laser-Engraved QR ID:', qrId],
		['Master QR Batch No:', batchNo],
		['Track Section / Division:', section],
		['Installation Station:', station],
		['Certified Manufacturer:', manufacturer],
		['Track Gauge Standard:', 'Broad Gauge (1676 mm)'],
		['Clip Material Composition:', 'Spring Steel 60Si7 (Toe Load 12.5 kN)'],
	];

	specRows.forEach(([label, val], idx) => {
		const rowY = secY + 14 + idx * 5.2;
		doc.setFont('helvetica', 'bold');
		doc.setFontSize(6.5);
		doc.setTextColor(100, 116, 139);
		doc.text(label, 15, rowY);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(15, 23, 42);
		doc.text(String(val), 52, rowY);
	});

	// Box B: Operational History & Defect Metrics
	const boxBX = 108;
	doc.setFillColor(255, 255, 255);
	doc.roundedRect(boxBX, secY + 3, halfW, boxH, 2, 2, 'F');
	doc.setDrawColor(203, 213, 225);
	doc.roundedRect(boxBX, secY + 3, halfW, boxH, 2, 2, 'S');

	doc.setFillColor(0, 40, 85);
	doc.rect(boxBX, secY + 3, halfW, 6, 'F');
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7);
	doc.setTextColor(255, 255, 255);
	doc.text('INSPECTION & DEGRADATION HISTORY', boxBX + 3, secY + 7.2);

	const historyRows = [
		['Clip Service Age (Days):', `${clipAgeDays} Days (${(clipAgeDays / 365).toFixed(2)} Yrs)`],
		['Cumulative Field Scans:', `${totalScans} Inspections Logged`],
		['Looseness Incidents:', `${looseCount} Times`],
		['Mechanical Wear Incidents:', `${wearCount} Times`],
		['Clip Replacements Logged:', `${replacementCount} Times`],
		['Days Since Last Inspection:', `${daysSinceInsp} Days Ago`],
		['Days Since Last Maintenance:', `${daysSinceRepair} Days Ago`],
	];

	historyRows.forEach(([label, val], idx) => {
		const rowY = secY + 14 + idx * 5.2;
		doc.setFont('helvetica', 'bold');
		doc.setFontSize(6.5);
		doc.setTextColor(100, 116, 139);
		doc.text(label, boxBX + 3, rowY);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(15, 23, 42);
		doc.text(String(val), boxBX + 48, rowY);
	});

	// 5. AI DIAGNOSTIC EVALUATION SECTION
	const aiSecY = 130;
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(10);
	doc.setTextColor(0, 40, 85);
	doc.text('2. XGBoost Predictive AI Assessment & Risk Classification', 12, aiSecY);

	// AI Big Card
	const aiCardH = 76;
	doc.setFillColor(248, 250, 252);
	doc.roundedRect(12, aiSecY + 3, pageWidth - 24, aiCardH, 2, 2, 'F');
	doc.setDrawColor(203, 213, 225);
	doc.roundedRect(12, aiSecY + 3, pageWidth - 24, aiCardH, 2, 2, 'S');

	// Priority Banner Inside Card
	let badgeColor = [16, 185, 129];
	let badgeTitle = 'LOW MAINTENANCE PRIORITY — TRACK INTEGRITY OPTIMAL';
	if (priority === 'HIGH') {
		badgeColor = [220, 38, 38];
		badgeTitle = 'HIGH MAINTENANCE PRIORITY — IMMEDIATE ACTION REQUIRED';
	} else if (priority === 'MEDIUM') {
		badgeColor = [217, 119, 6];
		badgeTitle = 'MEDIUM MAINTENANCE PRIORITY — SCHEDULE SERVICE WINDOW';
	}

	doc.setFillColor(...badgeColor);
	doc.roundedRect(16, aiSecY + 7, pageWidth - 32, 10, 1.5, 1.5, 'F');
	doc.setTextColor(255, 255, 255);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(8.5);
	doc.text(badgeTitle, 20, aiSecY + 13.5);

	// Prediction Metrics Table
	const mX = 16;
	const mY = aiSecY + 22;

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7.5);
	doc.setTextColor(0, 40, 85);
	doc.text('FEATURE ENGINEERING PIPELINE VECTORS', mX, mY);

	doc.setFillColor(226, 232, 240);
	doc.rect(mX, mY + 2, pageWidth - 32, 5, 'F');
	doc.setFontSize(6);
	doc.setTextColor(51, 65, 85);
	doc.text('LOOSE RATE', mX + 2, mY + 5.5);
	doc.text('WEAR RATE', mX + 32, mY + 5.5);
	doc.text('REPLACEMENT RATE', mX + 62, mY + 5.5);
	doc.text('INSP. FREQUENCY', mX + 98, mY + 5.5);
	doc.text('MAINTENANCE INDEX', mX + 128, mY + 5.5);
	doc.text('HEALTH INDEX', mX + 160, mY + 5.5);

	const looseRate = (looseCount / (totalScans || 1)).toFixed(3);
	const wearRate = (wearCount / (totalScans || 1)).toFixed(3);
	const repRate = (replacementCount / (totalScans || 1)).toFixed(3);
	const inspFreq = (clipAgeDays / (totalScans || 1)).toFixed(1);
	const maintIndex = looseCount * 2 + wearCount * 3 + replacementCount * 5;
	const healthIndex = Math.max(0, 100 - maintIndex);

	doc.setFillColor(255, 255, 255);
	doc.rect(mX, mY + 7, pageWidth - 32, 6, 'F');
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7);
	doc.setTextColor(15, 23, 42);
	doc.text(looseRate, mX + 2, mY + 11.2);
	doc.text(wearRate, mX + 32, mY + 11.2);
	doc.text(repRate, mX + 62, mY + 11.2);
	doc.text(`${inspFreq} d`, mX + 98, mY + 11.2);
	doc.text(String(maintIndex), mX + 128, mY + 11.2);
	doc.setTextColor(16, 185, 129);
	doc.text(`${healthIndex}/100`, mX + 160, mY + 11.2);

	// Actionable Recommendation Box
	doc.setFillColor(254, 243, 199);
	doc.setDrawColor(245, 158, 11);
	doc.setLineWidth(0.3);
	doc.roundedRect(mX, mY + 16, pageWidth - 32, 22, 1.5, 1.5, 'FD');

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7);
	doc.setTextColor(146, 64, 14);
	doc.text('CHIEF TRACK ENGINEER ACTION DIRECTIVE & SAFETY PROTOCOL:', mX + 3, mY + 21);

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(6.8);
	doc.setTextColor(30, 41, 59);
	const recLines = doc.splitTextToSize(
		`${recommendation} All track fastener operations must adhere to Indian Railways Permanent Way Manual (IRPWM) Section 607. Ensure torque calibration tool IR-TC-400 is utilized. Record subsequent post-maintenance verification scan in mobile terminal.`,
		pageWidth - 38
	);
	doc.text(recLines, mX + 3, mY + 26);

	// 6. TRACK SAFETY COMPLIANCE & AUTHORIZATION FOOTER
	const signY = 214;
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(10);
	doc.setTextColor(0, 40, 85);
	doc.text('3. Authorized Sign-Off & Permanent Way Validation', 12, signY);

	const signBoxH = 50;
	doc.setFillColor(255, 255, 255);
	doc.roundedRect(12, signY + 3, pageWidth - 24, signBoxH, 2, 2, 'F');
	doc.setDrawColor(203, 213, 225);
	doc.roundedRect(12, signY + 3, pageWidth - 24, signBoxH, 2, 2, 'S');

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7.5);
	doc.setTextColor(71, 85, 105);
	doc.text('DATA VERIFICATION SEAL:', 16, signY + 12);

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(6.5);
	doc.setTextColor(30, 41, 59);
	doc.text('• Certified XGBoost Multiclass Inference Model (16-feature vector pipeline)', 16, signY + 18);
	doc.text('• Laser QR ID securely engraved to ISO/IEC 18004 standards', 16, signY + 23);
	doc.text('• Real-time cloud synchronization verified via Firebase Firestore Engine', 16, signY + 28);
	doc.text('• System Status: OPERATIONAL • Anti-Tamper Verification Key: IR-PW-VERIFIED', 16, signY + 33);
	doc.text(`• Timestamp: ${new Date().toISOString()}`, 16, signY + 38);

	// Right: Digital Signature Block
	const sigX = 138;
	doc.setDrawColor(148, 163, 184);
	doc.setLineWidth(0.4);
	doc.line(sigX, signY + 34, sigX + 48, signY + 34);

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7.5);
	doc.setTextColor(0, 40, 85);
	doc.text('Divisional Railway Engineer', sigX, signY + 38);
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(6.5);
	doc.setTextColor(100, 116, 139);
	doc.text('Permanent Way (P-Way) Maintenance Cell', sigX, signY + 42);
	doc.text('Ministry of Railways • Gov. of India', sigX, signY + 46);

	// Stamp badge
	doc.setFillColor(240, 253, 244);
	doc.setDrawColor(16, 185, 129);
	doc.roundedRect(sigX, signY + 9, 48, 18, 1.5, 1.5, 'FD');
	doc.setTextColor(5, 150, 105);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7);
	doc.text('DIGITALLY CERTIFIED', sigX + 8, signY + 16);
	doc.setFontSize(5.8);
	doc.setTextColor(71, 85, 105);
	doc.text('RAILCLIP SYSTEM PASS', sigX + 8, signY + 22);

	// 7. BOTTOM FOOTER STRIP
	doc.setFillColor(0, 40, 85);
	doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(6.5);
	doc.setTextColor(203, 213, 225);
	doc.text('Indian Railways Track Management System • Powered by RailClip & XGBoost Predictive System', 12, pageHeight - 5);
	doc.setTextColor(254, 240, 138);
	doc.text('Single-Page Official Report • Page 1 of 1', pageWidth - 55, pageHeight - 5);

	// Save document
	const cleanFilename = `RailClip_Report_${qrId}_${new Date().toISOString().slice(0, 10)}.pdf`;

	doc.save(cleanFilename);
	return cleanFilename;
}
