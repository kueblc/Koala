class SourcesController < ApplicationController
  before_filter :grab_project
  
  def show
    @source = Source.find(params[:id])
  end
  
  def grab_project
    @project = Project.find(params[:project_id])
  end
end
