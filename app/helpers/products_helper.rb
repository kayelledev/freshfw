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
      image_tag product.url_default_image, class: "img-responsive", alt: "#{product.full_name}"
    elsif (product.default_image).present?
      image_tag product.default_image.catalog, class: "img-responsive", alt: "#{product.full_name}"
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
    ft = value / 12
    inch = value % 12
    "#{ft} ft #{inch} in"
  end

end
