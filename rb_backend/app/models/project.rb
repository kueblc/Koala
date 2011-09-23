class Project < ActiveRecord::Base
  belongs_to :user
  has_many :Sources
  has_many :Comments, :order => 'date_posted DESC'
  
  validates :authors, :presence => true
  validates :title, :presence => true, :length => { :within => 5..20 }
  validates :description, :presence => true, :length => { :within => 5..200 }
  validates :creation_time, :presence => true
end
