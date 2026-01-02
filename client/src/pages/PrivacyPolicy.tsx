import Navbar from "@/features/landing/components/Navbar";
import FooterSection from "@/features/landing/components/FooterSection";

const PrivacyPolicy = () => {
    return (
        <div
            data-page="landing"
            className="w-screen flex flex-col items-center justify-center bg-background"
        >
            <header>
                <Navbar />
            </header>

            <main className="w-full max-w-4xl flex flex-col gap-8 p-[5%] mt-[7rem] mb-10 text-foreground">
                <h1 className="text-4xl md:text-5xl text-center mb-8 text-primary">
                    Privacy Policy
                </h1>

                <section className="flex flex-col gap-4">
                    <p className="font-openSans leading-relaxed">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                    <p className="font-openSans leading-relaxed">
                        At Happr, we value your privacy. This Privacy Policy outlines how
                        we collect, use, and protect your personal information when you
                        use our platform.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        1. Information We Collect
                    </h2>
                    <p className="font-openSans leading-relaxed">
                        We collect information that is necessary to provide our services to
                        you, including:
                    </p>
                    <ul className="list-disc pl-6 font-openSans leading-relaxed space-y-2">
                        <li>
                            <strong>Account Information:</strong> Name, email address, and
                            password when you register.
                        </li>
                        <li>
                            <strong>Usage Data:</strong> Information about how you use our
                            features and tools to help us improve the platform.
                        </li>
                        <li>
                            <strong>Content:</strong> Data and content you generate or upload
                            while using our services.
                        </li>
                    </ul>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        2. How We Use Your Information
                    </h2>
                    <p className="font-openSans leading-relaxed">
                        We use the collected information for the following purposes:
                    </p>
                    <ul className="list-disc pl-6 font-openSans leading-relaxed space-y-2">
                        <li>To provide and maintain our Service.</li>
                        <li>To notify you about changes to our Service.</li>
                        <li>To provide customer support.</li>
                        <li>
                            To gather analysis or valuable information so that we can improve
                            our Service.
                        </li>
                    </ul>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        3. Data Security
                    </h2>
                    <p className="font-openSans leading-relaxed">
                        The security of your data is important to us. We implement appropriate technical
                        and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        4. Third-Party Services
                    </h2>
                    <p className="font-openSans leading-relaxed">
                        We may employ third-party companies and individuals to facilitate
                        our Service, to provide the Service on our behalf, or to assist us
                        in analyzing how our Service is used. These third parties have
                        access to your Personal Data only to perform these tasks on our
                        behalf and are obligated not to disclose or use it for any other
                        purpose.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        5. Changes to This Privacy Policy
                    </h2>
                    <p className="font-openSans leading-relaxed">
                        We may update our Privacy Policy from time to time. We will notify
                        you of any changes by posting the new Privacy Policy on this page.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        6. Contact Us
                    </h2>
                    <p className="font-openSans leading-relaxed">
                        If you have any questions about this Privacy Policy, please contact
                        us at privacy@happr.com.
                    </p>
                </section>
            </main>

            <footer className="w-full flex flex-col items-center p-[5%] -mt-6">
                <FooterSection />
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
