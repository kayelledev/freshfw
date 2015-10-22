class AddDepthToShoppeProducts < ActiveRecord::Migration

  def up
    add_column :shoppe_products, :depth, :integer, default: 0
    Shoppe::Product.all.each do |product|
      product.update(depth: product.height)
    end
    Shoppe::Product.update_all(height: 0)
  end

  def down
    Shoppe::Product.all.each do |product|
      product.update(height: product.depth)
    end
    remove_column :shoppe_products, :depth
  end

end
