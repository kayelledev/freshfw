module Shoppe
  class ProductCategory < ActiveRecord::Base

    belongs_to :parent, class_name: "ProductCategory"
    has_many :children, class_name: "ProductCategory", foreign_key: "parent_id"

    validate :parent_himself

    self.table_name = 'shoppe_product_categories'

    # Categories have an image attachment
    mount_uploader :default_image, ImageUploader
    #attachment :image

    # All products within this category
    has_many :products, :dependent => :restrict_with_exception, :class_name => 'Shoppe::Product'

    # Validations
    validates :name, :presence => true
    validates :permalink, :presence => true, :uniqueness => true, :permalink => true

    # All categories ordered by their name ascending
    scope :ordered, -> { order(:name) }

    # Set the permalink on callback
    before_validation { self.permalink = self.name.parameterize if self.permalink.blank? && self.name.is_a?(String) }

    def parent_name
      # it may not have a parent
      parent.try(:name)
    end

    def has_parent?
      parent.present?
    end

    def has_children?
      children.exists?
    end

    def parent_himself
      if self.id && self.id == self.parent_id
        errors.add(:parent, "himself a parent")
      end
    end


  def self.categories_to_tree
    categories = Shoppe::ProductCategory.all.order(:name).to_a

    nodes = categories.select{|category| category.children.count==0}

    @nodes = nodes.map do |node|
      categories.reject!{|category| category.id == node.id}
      x = {}
      x[:text] = node.name
      x[:id] = node.id
      x[:href] = ['product_categories', node.id, 'edit'].join('/')
      x
    end

    categories = categories.compact
    while !categories.empty? do
      categories.each_with_index do |category, index_c|
        flag = false
        children = category.children.map(&:id)
        @nodes.each_with_index do |node, index_n|
          if children.include?(node[:id])
            flag = true
            x = @nodes.compact.find{|node| node[:text].eql?(category.name)}.nil? ? {} : @nodes.compact.find{|node| node[:text].eql?(category.name)}
            if x.empty?
              x[:text] = category.name
              x[:id] = category.id
              x[:href] = ['product_categories', category.id, 'edit'].join('/')
              x[:nodes] = []
            end
            x[:nodes] << node
            @nodes[index_n] = nil
            @nodes << x
          end
        end
        @nodes = @nodes.compact.uniq
        categories[index_c] = nil if flag
      end
      categories = categories.compact
    end
    @nodes
  end


  end
end
