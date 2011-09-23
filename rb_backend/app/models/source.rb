class Source < ActiveRecord::Base
  belongs_to :project
  validates :name, :presence => true, :length => { :within => 3..30 }
  validates :source_code, :presence => true
  validates :contributions, :presence => true
  validates :project_id, :presence => true
  validates :creation_time, :presence => true
  
end
