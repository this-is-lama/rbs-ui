import { HowItWorksSection } from '@/widgets/home/how-it-works-section/ui/HowItWorksSection';
import styles from './HomePage.module.scss';
import {Footer} from "@/widgets/footer/Footer.tsx";
import { AdvantagesSection } from '@/widgets/home/advantages-section/ui/AdvantagesSection';
import { HomeHero } from '@/widgets/home/home-hero/ui/HomeHero';
import { AboutSection } from '@/widgets/home/about-section/ui/AboutSection';

export const HomePage = () => {
    return (
        <div className={styles.page}>
            <HomeHero />
            <AboutSection />
            <AdvantagesSection />
            <HowItWorksSection />
            <Footer />
        </div>
    );
};