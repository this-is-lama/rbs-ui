import { HomeHero } from '@/widgets/home/home-hero/ui/HomeHero';
import { AboutSection } from '@/widgets/home/about-section/ui/AboutSection';
import { HowItWorksSection } from '@/widgets/home/how-it-works-section/ui/HowItWorksSection';
import { AdvantagesSection } from '@/widgets/home/advantages-section/ui/AdvantagesSection';
import { Footer } from '@/widgets/footer/Footer';
import styles from './HomePage.module.scss';

export const HomePage = () => {
    return (
        <div className={styles.page}>
            <HomeHero />
            <AboutSection />
            <HowItWorksSection />
            <AdvantagesSection />
            <Footer />
        </div>
    );
};