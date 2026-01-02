import Navbar from "@/features/landing/components/Navbar";
import FooterSection from "@/features/landing/components/FooterSection";

const TermsOfService = () => {
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
                    Terms of Service
                </h1>

                <section className="flex flex-col gap-4">
                    <p className="font-openSans leading-relaxed">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                    <p className="font-openSans leading-relaxed">
                        Welcome to Happr! These Terms of Service ("Terms") govern your use
                        of our website and services (collectively, the "Service"). By
                        accessing or using Happr, you agree to be bound by these Terms.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        1. Acceptance of Terms
                    </h2>
                    <p className="font-openSans leading-relaxed">
                        By creating an account or using our services, you agree to comply
                        with these Terms and strictly adhere to all applicable laws and
                        regulations. If you do not agree with any part of these terms, you
                        may not use our Service.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        2. Description of Service
                    </h2>
                    <p className="font-openSans leading-relaxed">
                        Happr provides tools for creators, including AI-driven content
                        generation and management features. We continually improve our
                        Service and may modify or discontinue features at any time without
                        prior notice.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        3. User Accounts
                    </h2>
                    <ul className="list-disc pl-6 font-openSans leading-relaxed space-y-2">
                        <li>
                            You must provide accurate and complete information when creating
                            an account.
                        </li>
                        <li>
                            You are responsible for maintaining the security of your account
                            credentials.
                        </li>
                        <li>
                            You are solely responsible for all activities that occur under
                            your account.
                        </li>
                    </ul>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        4. User Conduct
                    </h2>
                    <p className="font-openSans leading-relaxed">
                        You agree not to use the Service to:
                    </p>
                    <ul className="list-disc pl-6 font-openSans leading-relaxed space-y-2">
                        <li>Violate any laws or regulations.</li>
                        <li>Infringe upon the intellectual property rights of others.</li>
                        <li>
                            Upload or generate content that is harmful, offensive, or
                            illegal.
                        </li>
                        <li>Interfere with or disrupt the integrity of the Service.</li>
                    </ul>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        5. Intellectual Property
                    </h2>
                    <p className="font-openSans leading-relaxed">
                        Your content remains yours. However, by using our Service, you
                        grant Happr a limited license to host, store, and process your
                        content solely for the purpose of providing the service to you.
                        Happr retains all rights to its platform, code, and branding.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        6. Termination
                    </h2>
                    <p className="font-openSans leading-relaxed">
                        We reserve the right to suspend or terminate your account at our
                        sole discretion if you violate these Terms or for any other reason
                        we deem necessary to protect our platform and users.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        7. Disclaimer of Warranties
                    </h2>
                    <p className="font-openSans leading-relaxed">
                        The Service is provided "as is" and "as available" without any
                        warranties of any kind, express or implied.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl text-primary">
                        8. Contact Us
                    </h2>
                    <p className="font-openSans leading-relaxed">
                        If you have any questions about these Terms, please contact us at
                        support@happr.com.
                    </p>
                </section>
            </main>

            <footer className="w-full flex flex-col items-center p-[5%] -mt-6">
                <FooterSection />
            </footer>
        </div>
    );
};

export default TermsOfService;
