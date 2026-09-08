"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { withBasePath, getApiUrl } from "@/utils/paths";
import { prisma } from "@/lib/prisma";
import { useEffect, useState } from "react";

async function getJobs() {
  try {
    return await prisma.job.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    return [];
  }
}

async function getCareerFeatures() {
  try {
    return await prisma.careerFeature.findMany({
      orderBy: {
        order: "asc",
      },
    });
  } catch (error) {
    return [];
  }
}

export default async function CareerPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCareerData = async () => {
      try {
        const [jobsResponse, featuresResponse] = await Promise.all([
          fetch(getApiUrl("/api/jobs")),
          fetch(getApiUrl("/api/career-features")),
        ]);

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData);
        }

        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json();
          setFeatures(featuresData);
        }
      } catch (error: any) {
        setError(error?.message || "Failed to load career data.");
      }
    };

    loadCareerData();
  }, []);

  return (
    <div className="preload career-page">
      <Preloader />
      <Header />
      <section className="job_hero_area bgimage">
        <div className="bg_image_holder">
          <img src={withBasePath("/images/job_hero.jpg")} alt="" />
        </div>
        <div className="container content_above">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="job_hero_content">
                <h1>
                  Get A Job At
                  <span className="highlight">BackTheme</span>
                </h1>
                <p>
                  Nunc placerat mi id nisi interdum mollis. Praesent pharetra
                  justo ut sceler isque the mattis, leo quam aliquet congue this
                  there placera
                </p>
              </div>
              <Link href="#" className="btn btn--round btn--white btn--lg">
                Open Positions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="job_area section--padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h1>
                  Open
                  <span className="highlighted">Positions</span>
                </h1>
                <p>
                  Laborum dolo rumes fugats untras. Etharums ser quidem rerum
                  facilis dolores nemis omnis fugats. Lid est laborum dolo rumes
                  fugats untras.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            {jobs.map((job) => (
              <div key={job.id} className="col-lg-6 col-md-6">
                <div className="card_style2">
                  <h4 className="card_style2__title">{job.title}</h4>
                  <div className="card_style2__location_type">
                    <p>
                      <span className="lnr lnr-map-marker"></span>
                      {job.location}
                    </p>
                    <span className={`type ${job.typeClass}`}>{job.type}</span>
                  </div>
                  <Link href={`/job/detail/${job.slug}`}>
                    Learn More and Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="feature_area section--padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h1>
                  Open
                  <span className="highlighted">Positions</span>
                </h1>
                <p>
                  Laborum dolo rumes fugats untras. Etharums ser quidem rerum
                  facilis dolores nemis omnis fugats. Lid est laborum dolo rumes
                  fugats untras.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            {features.map((feature, index) => (
              <div key={index} className="col-lg-6 col-md-6">
                <div className="single_feature">
                  <div className="feature__icon">
                    <span className={`lnr ${feature.icon}`}></span>
                  </div>
                  <div className="feature__content">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content_block5 section--padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-5 col-md-6 v_middle">
              <div className="content_block5_content">
                <h1>
                  Find Out More About
                  <span className="highlighted">BackTheme</span>
                </h1>
                <p>
                  Nunc placerat mi id nisi interdum mollis. Praesent pharetra
                  justo ut sceler isque the mattis, leo quam aliquet congue this
                  there placerat mi id nisi they interdum mollis. Praesent phare
                  tra justo ut sceleris que the mattis, leo quam aliquet. Nunc
                  placer atmi id nisi interdum mollis quam.
                </p>
                <Link href="/about" className="btn btn--default btn--round">
                  About Us
                </Link>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 offset-lg-1 v_middle">
              <Image
                src={withBasePath("/images/knous.jpg")}
                alt="The Image is not available or broken"
                width={600}
                height={400}
              />
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
