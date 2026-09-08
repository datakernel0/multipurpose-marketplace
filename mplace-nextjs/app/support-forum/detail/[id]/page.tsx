"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import CallToActionSection from "@/components/sections/CallToActionSection";
import Image from "next/image";
import Link from "next/link";
import { withBasePath } from "@/utils/paths";

interface Reply {
  id: number;
  author: string;
  authorAvatar: string;
  isStaff?: boolean;
  timeAgo: string;
  content: string;
  upvotes: number;
  downvotes: number;
  isUpvoted?: boolean;
}

export default function SupportForumDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [comment, setComment] = useState("");

  const replies: Reply[] = [
    {
      id: 1,
      author: "BackTheme",
      authorAvatar: "/images/notification_head2.png",
      isStaff: true,
      timeAgo: "Answered 3 days ago",
      content:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
      upvotes: 5,
      downvotes: 0,
      isUpvoted: true,
    },
    {
      id: 2,
      author: "BackTheme",
      authorAvatar: "/images/notification_head.png",
      timeAgo: "Answered 3 days ago",
      content:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
      upvotes: 3,
      downvotes: 1,
    },
    {
      id: 3,
      author: "BackTheme",
      authorAvatar: "/images/notification_head6.png",
      timeAgo: "Answered 3 days ago",
      content:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
      upvotes: 2,
      downvotes: 0,
    },
  ];

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle comment submission
    alert("Comment submitted! Check console for submitted data.");
    setComment("");
  };

  return (
    <div className="preload support-forum-detail-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Support Forum"
        paths={[
          { name: "Forum", link: "/support-forum" },
          { name: "Forum Details", link: `/support-forum/detail/${params.id}` },
        ]}
      />
      <section className="support_threads_area section--padding2">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="forum_detail_area">
                <div className="cardify forum--issue">
                  <div className="title_vote clearfix">
                    <h3>Responsive Website Footer Menu</h3>

                    <div className="vote">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setUpvoted(!upvoted);
                          setDownvoted(false);
                        }}
                        className={upvoted ? "active" : ""}
                      >
                        <span className="lnr lnr-thumbs-up"></span>
                      </a>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setDownvoted(!downvoted);
                          setUpvoted(false);
                        }}
                        className={downvoted ? "active" : ""}
                      >
                        <span className="lnr lnr-thumbs-down"></span>
                      </a>
                    </div>
                  </div>
                  <div className="suppot_query_tag">
                    <Link href="#" className="user">
                      <Image
                        className="poster_avatar"
                        src={withBasePath("/images/support_avat1.png")}
                        alt="Support Avatar"
                        width={30}
                        height={30}
                      />{" "}
                      Mitesh Chavda{" "}
                    </Link>
                    <span>asked 3 weeks ago</span>
                    <span className="support_tag">item discussion</span>
                  </div>
                  <p>
                    Nunc placerat mi id nisi interdum they mollis. Praesent
                    pharetra, justot scel erisque the mattis leo quam. Nunc
                    placerat mi id nisi interdum they mollis. Praesent phare
                    tra, justo ut scel eris que the mattis, leo quam placerat mi
                    id nisi interdum mollis
                  </p>
                </div>

                <div className="forum--replays cardify">
                  <div className="area_title">
                    <h4>{replies.length} Answers</h4>
                  </div>

                  {replies.map((reply) => (
                    <div key={reply.id} className="forum_single_reply">
                      <div className="reply_avatar">
                        <Image
                          src={withBasePath(reply.authorAvatar)}
                          alt="reply avatar"
                          width={60}
                          height={60}
                        />
                      </div>

                      <div className="reply_content">
                        <div className="name_vote">
                          <div className="pull-left">
                            <h4>
                              {reply.author}
                              {reply.isStaff && <span>staff</span>}
                            </h4>
                            <p>{reply.timeAgo}</p>
                          </div>

                          <div className="vote">
                            <a
                              href="#"
                              className={reply.isUpvoted ? "active" : ""}
                            >
                              <span className="lnr lnr-thumbs-up"></span>
                            </a>
                            <a href="#" className="">
                              <span className="lnr lnr-thumbs-down"></span>
                            </a>
                          </div>
                        </div>
                        <p>{reply.content}</p>
                      </div>
                    </div>
                  ))}

                  <div className="comment-form-area">
                    <h4>Leave a comment</h4>
                    <div className="media comment-form support__comment">
                      <div className="media-left">
                        <Link href="#">
                          <Image
                            className="media-object"
                            src={withBasePath("/images/m7.png")}
                            alt="Commentator Avatar"
                            width={50}
                            height={50}
                          />
                        </Link>
                      </div>
                      <div className="media-body">
                        <form
                          action="#"
                          className="comment-reply-form"
                          onSubmit={handleSubmitComment}
                        >
                          <div id="trumbowyg-demo">
                            <textarea
                              className="text_field"
                              placeholder="Write your comment here..."
                              rows={5}
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            ></textarea>
                          </div>
                          <button
                            type="submit"
                            className="btn btn--sm btn--round"
                          >
                            Post Comment
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <aside className="sidebar support--sidebar">
                <Link href="/login" className="login_promot">
                  <span className="lnr lnr-lock"></span>Login to Ask a Question
                </Link>

                <div className="sidebar-card card--forum_categories">
                  <div className="card-title">
                    <h4>Forum Categories</h4>
                  </div>
                  <div className="collapsible-content">
                    <ul className="card-content">
                      {[
                        { name: "Wordpress", count: 35 },
                        { name: "Support Center", count: 45 },
                        { name: "General Topics", count: 13 },
                        { name: "Pre-Sales", count: 8 },
                        { name: "Purchases", count: 34 },
                        { name: "Billing", count: 78 },
                        { name: "Testimonials", count: 26 },
                      ].map((category) => (
                        <li key={category.name}>
                          <Link href="#">
                            <span className="lnr lnr-chevron-right"></span>
                            {category.name}
                            <span className="item-count">{category.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="sidebar-card card--top_discussion">
                  <div className="card-title">
                    <h4>Top Discussions</h4>
                  </div>
                  <div className="collapsible-content">
                    <ul className="card-content">
                      {[
                        "Commissions Transfer Problem ( 12h )",
                        "Dashboard not updating ( 9h )",
                        "AdminPro ( 2d )",
                        "Bill required after purchase ( 3d )",
                        "How to install the theme? ( 7d )",
                        "Contact Form not Working ( 9d )",
                      ].map((discussion, index) => (
                        <li key={index}>
                          <Link href="#">
                            <span></span>
                            {discussion}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
