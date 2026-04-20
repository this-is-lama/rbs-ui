import { HomeHero } from '@/widgets/home/home-hero';
import { AboutSection } from '@/widgets/home/about-section';
import { HowItWorksSection } from '@/widgets/home/how-it-works-section';
import { AdvantagesSection } from '@/widgets/home/advantages-section';
import { Footer } from '@/widgets/footer';
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
