"use client"

import { useState, useRef, useEffect } from "react"
import Slider from "react-slick"
import { withBasePath } from "@/utils/paths"

interface ProductImage {
  id: number
  url: string
  thumbnail: string
}

interface ProductImageSliderProps {
  images: ProductImage[]
}

export default function ProductImageSlider({ images }: ProductImageSliderProps) {
  const [nav1, setNav1] = useState<Slider | null>(null)
  const [nav2, setNav2] = useState<Slider | null>(null)
  const previewSliderRef = useRef<Slider>(null)
  const thumbSliderRef = useRef<Slider>(null)

  useEffect(() => {
    setNav1(previewSliderRef.current)
    setNav2(thumbSliderRef.current)
  }, [])

  const previewSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: nav2 as any,
  }

  const thumbSettings = {
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: false,
    focusOnSelect: true,
    asNavFor: nav1 as any,
    responsive: [
      {
        breakpoint: 479,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  }

  const thumbNavPrev = () => {
    thumbSliderRef.current?.slickPrev()
  }

  const thumbNavNext = () => {
    thumbSliderRef.current?.slickNext()
  }

  const previewImages = images.map((img) => ({
    id: img.id,
    image: withBasePath(img.url),
  }))

  const thumbImages = images.map((img) => ({
    id: img.id,
    image: withBasePath(img.thumbnail),
  }))

  return (
    <div className="item-preview">
      <div className="item__preview-slider">
        <Slider ref={previewSliderRef} {...previewSettings}>
          {previewImages.map((img) => (
            <div key={img.id} className="prev-slide">
              <div className="product-preview-image-container">
                <img 
                  className="product-preview-image"
                  src={img.image} 
                  alt="Product preview" 
                />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <div className="item__preview-thumb">
        <div className="prev-thumb">
          <div className="thumb-slider">
            <Slider ref={thumbSliderRef} {...thumbSettings}>
              {thumbImages.map((thumb) => (
                <div key={thumb.id} className="item-thumb">
                  <div className="product-thumbnail-container">
                    <img 
                      className="product-thumbnail-image"
                      src={thumb.image} 
                      alt="Thumbnail" 
                    />
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          <div className="prev-nav thumb-nav">
            <span className="lnr nav-left lnr-arrow-left" onClick={thumbNavPrev}></span>
            <span className="lnr nav-right lnr-arrow-right" onClick={thumbNavNext}></span>
          </div>
        </div>
      </div>
    </div>
  )
}

