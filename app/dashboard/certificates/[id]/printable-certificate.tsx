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
            margin: 0;
          }
          body * { visibility: hidden; }
          #cert-print, #cert-print * { visibility: visible; }
          #cert-print {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
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
