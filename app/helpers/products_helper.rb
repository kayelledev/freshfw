module ProductsHelper
  def root_product
    @product.parent || @product
  end

  def product_visibility product
    return 'none' if product.has_variants?
    (product.default? || !product.parent)? 'block' : 'none'
  end

  def default_image(product)
    if (product.url_default_image).present?
      image_tag product.url_default_image, class: "img-responsive portfolio-image", alt: "#{product.full_name}"
    elsif (product.default_image).present?
      image_tag product.default_image.catalog, class: "img-responsive portfolio-image", alt: "#{product.full_name}"
    else
      nil
    end
  end

  def default_category_image(category)
    if (category.default_image).present?
      image_tag category.default_image.catalog, class: "img-responsive portfolio-image", alt: "#{category.name}"
    else
      nil
    end
  end


  def default_image_better_quality(product)
    if (product.url_default_image).present?
      image_tag product.url_default_image, class: "img-responsive portfolio-image", alt: "#{product.full_name}"
    elsif (product.default_image).present?
      image_tag product.default_image, class: "img-responsive portfolio-image", alt: "#{product.full_name}"
    else
      nil
    end
  end

  def array_images
    ['default_image'] + (2..6).map{|index| "image#{index}"}
  end

  def image_link(product, img)
    if (product.send "url_#{img}").present?
      product.send "url_#{img}"
    elsif (product.send img).present?
      image = product.send img
      image.url
    else
      nil
    end
  end

  def full_measure(value)
    ft = value.to_i / 12
    inch = value.to_i % 12
    {ft: ft, inch: inch}
  end

  def product_dimensions(product)
    "#{product.width}\" x #{product.depth}\" x #{product.height}\""
  end

end
