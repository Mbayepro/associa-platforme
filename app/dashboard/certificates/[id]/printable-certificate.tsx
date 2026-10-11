import { CertificateVisual } from '@/components/certificate-visual';
import { CertificatePreview } from '@/components/certificate-preview';

export function PrintableCertificate({
  certificate,
  verificationUrl,
}: {
  certificate: any;
  verificationUrl: string;
}) {
  const org = certificate.organization;
  const member = certificate.member;

  return (
    <>
      {/* Forcer le mode paysage via une balise style injectée */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0 !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            overflow: hidden !important;
            background: white !important;
          }
          body * {
            visibility: hidden !important;
          }
          #cert-print, #cert-print * {
            visibility: visible !important;
          }
          #cert-print {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .cert-wrapper-print {
            width: 297mm !important;
            height: 210mm !important;
            box-shadow: none !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      <div
        id="cert-print"
        className="hidden print:flex items-center justify-center w-full h-full"
      >
        <CertificatePreview>
          <CertificateVisual
            participantName={`${member.first_name} ${member.last_name}`}
            memberNumber={member.member_number}
            sessionType={certificate.type}
            sessionTitle={certificate.title}
            issuedAt={certificate.issued_at}
            verificationToken={certificate.verification_token}
            orgName={org.name}
            orgLogo={org.logo_url}
            colorPrimary={org.color_primary}
          />
        </CertificatePreview>
      </div>
    </>
  );
}
